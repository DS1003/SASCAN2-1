import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@sonatelacademy.sn' },
    update: {},
    create: {
      email: 'admin@sonatelacademy.sn',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Sonatel',
      role: UserRole.ADMIN,
    },
  });

  // Create vigil user
  const vigilPassword = await bcrypt.hash('Vigil123!', 10);
  await prisma.user.upsert({
    where: { email: 'vigil@sonatelacademy.sn' },
    update: {},
    create: {
      email: 'vigil@sonatelacademy.sn',
      password: vigilPassword,
      firstName: 'Vigil',
      lastName: 'Sonatel',
      role: UserRole.VIGIL,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });