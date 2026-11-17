const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'customer@gmail.com';
  const password = 'user123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Demo Customer',
      phone: '081234567891',
      role: 'CUSTOMER',
      password: hashedPassword,
      customerProfile: {
        upsert: {
          create: {
            address: 'Jl. Demo Customer No. 1',
            city: 'Jakarta',
            notes: 'Akun demo customer untuk testing aplikasi',
          },
          update: {
            address: 'Jl. Demo Customer No. 1',
            city: 'Jakarta',
            notes: 'Akun demo customer untuk testing aplikasi',
          },
        },
      },
    },
    create: {
      name: 'Demo Customer',
      email,
      phone: '081234567891',
      role: 'CUSTOMER',
      password: hashedPassword,
      customerProfile: {
        create: {
          address: 'Jl. Demo Customer No. 1',
          city: 'Jakarta',
          notes: 'Akun demo customer untuk testing aplikasi',
        },
      },
    },
    include: { customerProfile: true },
  });

  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasProfile: Boolean(user.customerProfile),
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
