import { prisma } from "./connectDb.js";
import bcrypt from "bcrypt";

export async function authorizeUser(userEmail: string) {
  try {
    const user = await prisma.$transaction([
      prisma.user.findFirst({
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

export async function createNewUser(
  userName: string,
  userEmail: string,
  password: string
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
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
