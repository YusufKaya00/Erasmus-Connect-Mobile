import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('🔄 Creating demo user...');

    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ahmet.yilmaz@example.com' },
    });

    if (existingUser) {
      console.log('✅ Demo user already exists!');
      console.log('Email: ahmet.yilmaz@example.com');
      console.log('Password: demo123');
      return;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'ahmet.yilmaz@example.com',
        password: hashedPassword,
        isVerified: true,
      },
    });

    // Create profile
    await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        bio: 'Demo kullanıcı hesabı',
        destinationCity: 'Barcelona',
        destinationCountryId: 1, // Varsayılan olarak İspanya
        academicTerm: 'SPRING',
        academicYear: '2024/2025',
        homeUniversity: 'İstanbul Üniversitesi',
      },
    });

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('📧 Email: ahmet.yilmaz@example.com');
    console.log('🔑 Password: demo123');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();

