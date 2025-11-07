import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import "dotenv/config";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating role to ADMIN...');
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@test.com' },
        data: { role: UserRole.ADMIN },
      });
      console.log(`Successfully updated user "${updatedUser.email}" to ADMIN.`);
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
        isVerified: true,
      },
    });

    console.log(`Successfully created admin user "${adminUser.email}" with password "admin123"`);
  } catch (error) {
    console.error('An error occurred while creating the admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
