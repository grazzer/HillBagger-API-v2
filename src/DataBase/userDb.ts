import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  omit: {
    users: { password: true },
  },
});

async function authorizeUser(userEmail: string) {
  try {
    const user = await prisma.$transaction([
      prisma.users.findFirst({
        where: { email: userEmail },
        omit: {
          password: false,
        },
      }),
    ]);
    return user[0];
  } catch (error) {
    throw error;
  }
}

async function registerUser(
  userName: string,
  userEmail: string,
  password: string
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        name: userName,
        email: userEmail,
        password: hashedPassword,
        photo: null,
        following: [],
      },
    });
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId: any) {
  try {
    const user = await prisma.$transaction([
      prisma.users.findFirst({
        where: { id: userId },
      }),
    ]);
    return user[0];
  } catch (error) {
    throw error;
  }
}

export { authorizeUser, registerUser, getUserById, prisma };
