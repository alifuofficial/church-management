import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@church.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    console.log('Email: admin@church.com');
    return;
  }

  // Create default admin user
  const hashedPassword = await hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@church.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
      isActive: true,
    },
  });

  console.log('Default admin user created successfully!');
  console.log('Email: admin@church.com');
  console.log('Password: admin123');
  console.log('Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
