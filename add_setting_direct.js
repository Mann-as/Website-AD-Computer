const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('better-sqlite3');

const prisma = new PrismaClient();

// Read the database file path from prisma schema
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const dbPath = dbUrl.replace('file:', '').replace('file://', '');

// Open SQLite database directly
const database = new sqlite3(dbPath);

// Create the Setting table
database.exec(`
  CREATE TABLE IF NOT EXISTS "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default settings
const settings = [
  { key: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY || '', description: 'Google Gemini API key for AI Assistant' },
  { key: 'GEMINI_MODEL', value: process.env.GEMINI_MODEL || 'gemini-3.5-flash', description: 'Gemini model name' },
  { key: 'NEXT_PUBLIC_APP_NAME', value: process.env.NEXT_PUBLIC_APP_NAME || 'AD Computer', description: 'Application name' },
  { key: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', description: 'Application URL' },
];

for (const setting of settings) {
  const stmt = database.prepare(
    `INSERT OR IGNORE INTO "Setting" ("key", "value", "description") VALUES (?, ?, ?)`
  );
  stmt.run(setting.key, setting.value, setting.description);
  console.log(`Inserted setting: ${setting.key}`);
}

stmt.finalize();

// Verify
const rows = database.all(`SELECT * FROM "Setting"`);
console.log('All settings in database:', rows);

database.close();
prisma.$disconnect();
console.log('Done!');