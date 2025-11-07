import { PrismaClient, UserRole } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function promoteUserToAdmin(email: string) {
  if (!email) {
    console.error('Usage: ts-node promote-admin.ts <user-email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    if (user.role === UserRole.ADMIN) {
      console.log(`User "${email}" is already an ADMIN.`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });

    console.log(`Successfully promoted user "${updatedUser.email}" to ADMIN.`);
  } catch (error) {
    console.error('An error occurred while promoting the user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const userEmail = process.argv[2];
promoteUserToAdmin(userEmail);
