const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create the Setting table using raw SQL
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Setting" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "value" TEXT,
      "description" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  // Insert default settings
  const defaultSettings = [
    { key: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY || '', description: 'Google Gemini API key for AI Assistant' },
    { key: 'GEMINI_MODEL', value: process.env.GEMINI_MODEL || 'gemini-3.5-flash', description: 'Gemini model name' },
    { key: 'NEXT_PUBLIC_APP_NAME', value: process.env.NEXT_PUBLIC_APP_NAME || 'AD Computer', description: 'Application name' },
    { key: 'NEXT_PUBLIC_APP_URL', value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', description: 'Application URL' },
  ];
  
  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
    console.log(`Upserted setting: ${setting.key}`);
  }
  
  // Verify
  const allSettings = await prisma.setting.findMany();
  console.log('All settings:', allSettings);
  
  await prisma.$disconnect();
  console.log('Done!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});