import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database (ADMIN/CUSTOMER login, Technician sebagai entitas kelolaan Admin)...');

  await prisma.aIConversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.serviceRequestStatusHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.service.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Ahmad',
      email: 'ahmad@adcomputer.com',
      password: adminPassword,
      phone: '081234567890',
      role: 'ADMIN',
      customerProfile: {
        create: {
          address: 'Cirebon',
          city: 'Cirebon',
          notes: 'Administrator AD Computer',
        },
      },
    },
    include: { customerProfile: true },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: 'Ahmad Wijaya',
      email: 'customer1@gmail.com',
      password: userPassword,
      phone: '089876543210',
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          address: 'Jl. Sudirman No. 12',
          city: 'Jakarta Selatan',
          notes: 'Customer prioritas perusahaan startup',
        },
      },
    },
    include: { customerProfile: true },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Siti Rahma',
      email: 'customer2@gmail.com',
      password: userPassword,
      phone: '081122334455',
      role: 'CUSTOMER',
      customerProfile: {
        create: {
          address: 'Jl. Gatot Subroto No. 45',
          city: 'Bandung',
          notes: 'Request service rutin akhir pekan',
        },
      },
    },
    include: { customerProfile: true },
  });

  const customerDemo = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: {
      name: 'Customer Demo',
      email: 'customer@gmail.com',
      password: userPassword,
      phone: '089876543211',
      role: 'CUSTOMER',
      customerProfile: {
        create: { address: 'Jl. Demo No. 1', city: 'Jakarta', notes: 'Akun demo customer (sinkron dengan halaman login)' },
      },
    },
    include: { customerProfile: true },
  });

  console.log(`Users: Admin ${admin.email}, Customer ${customer1.email}, ${customer2.email}, ${customerDemo.email}`);

  // Technicians sebagai entitas kelolaan Admin (bukan akun login)
  const tech1 = await prisma.technician.create({
    data: { name: 'Budi Santoso', email: 'budi.tech@adcomputer.com', phone: '081333444555', specialization: 'Laptop & Hardware', isActive: true },
  });
  const tech2 = await prisma.technician.create({
    data: { name: 'Rina Wijaya', email: 'rina.tech@adcomputer.com', phone: '081333444556', specialization: 'Software & Networking', isActive: true },
  });
  const tech3 = await prisma.technician.create({
    data: { name: 'Agus Prasetyo', email: 'agus.tech@adcomputer.com', phone: '081333444557', specialization: 'IT Support On-Site', isActive: true },
  });
  console.log(`Technicians: ${tech1.name}, ${tech2.name}, ${tech3.name}`);

  const serviceItems = [
    {
      name: 'Service Laptop Overhaul & Thermal Paste',
      slug: 'service-laptop-overhaul',
      category: 'COMPUTER_REPAIR',
      description: 'Pembersihan debu total, ganti thermal paste berkualitas tinggi, tuning kipas & temperatur.',
      price: 150000,
      estimatedDuration: '1 - 2 Jam',
      isActive: true,
    },
    {
      name: 'Install Windows 11 Original & Software Suite',
      slug: 'install-windows-11-software',
      category: 'SOFTWARE',
      description: 'Install ulang OS Windows 11 clean install, driver update, Office & Software esensial.',
      price: 100000,
      estimatedDuration: '1 Jam',
      isActive: true,
    },
    {
      name: 'Setup Network Router & Mikrotik Office',
      slug: 'setup-network-mikrotik',
      category: 'NETWORKING',
      description: 'Instalasi jaringan LAN, konfigurasi Router Mikrotik, Wi-Fi Access Point & bandwidth limiter.',
      price: 350000,
      estimatedDuration: '3 - 5 Jam',
      isActive: true,
    },
    {
      name: 'Maintenance Komputer Bulanan Kantor',
      slug: 'maintenance-komputer-kantor',
      category: 'MAINTENANCE',
      description: 'Jasa perawatan rutin komputer kantor bulanan, backup data, dan respon darurat.',
      price: 500000,
      estimatedDuration: 'Kontrak Bulanan',
      isActive: true,
    },
    {
      name: 'On-Site IT Troubleshooting & Support',
      slug: 'onsite-it-support',
      category: 'IT_SUPPORT',
      description: 'Kunjungan IT langsung ke lokasi kantor atau rumah untuk diagnosa hardware/software.',
      price: 200000,
      estimatedDuration: '2 Jam',
      isActive: true,
    },
  ];

  for (const s of serviceItems) await prisma.service.create({ data: s });
  console.log('Seeded 5 Services');

  const laptopService = await prisma.service.findUnique({ where: { slug: 'service-laptop-overhaul' } });

  const request = await prisma.serviceRequest.create({
    data: {
      ticketNumber: 'TKT-20260831-001',
      customerId: customer1.id,
      technicianId: tech1.id,
      serviceId: laptopService?.id,
      problemDescription: 'Laptop ASUS ROG sering overheat dan fan berisik saat dipakai rendering video.',
      serviceType: 'DROP_OFF',
      status: 'IN_PROGRESS',
      estimatedCost: 150000,
      finalCost: 150000,
      adminNotes: 'Prioritas tinggi, perangkat sudah diserahkan di konter workshop.',
      technicianNotes: 'Deep clean heatsink selesai, penggantian thermal paste arctic MX-6.',
      statusHistory: {
        create: [
          { newStatus: 'REQUESTED', changedBy: customer1.id, note: 'Tiket service dibuat oleh customer.' },
          { oldStatus: 'REQUESTED', newStatus: 'CONFIRMED', changedBy: admin.id, note: 'Tiket dikonfirmasi oleh Admin.' },
          { oldStatus: 'CONFIRMED', newStatus: 'IN_PROGRESS', changedBy: admin.id, note: 'Pengerjaan dimulai, ditugaskan ke Budi Santoso.' },
        ],
      },
      payments: { create: [{ amount: 150000, status: 'UNPAID', paymentMethod: 'TRANSFER_BANK' }] },
    },
  });

  console.log(`Sample Ticket: ${request.ticketNumber} -> ${tech1.name}`);
  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error('Error seeding:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
