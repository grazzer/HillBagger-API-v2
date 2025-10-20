import { prisma } from "./connectDb.js";
import bcrypt from "bcrypt";

const selectFields = {
  id: true,
  name: true,
  photo: true,
  friendIDs: true,
  assentIDs: true,
};

export async function getUserById(userId: any) {
  try {
    const user = await prisma.$transaction([
      prisma.user.findFirst({
        where: { id: userId },
        select: selectFields,
      }),
    ]);
    return user[0];
  } catch (error) {
    throw error;
  }
}

export async function getUserByName(userName: string) {
  try {
    const user = await prisma.$transaction([
      prisma.user.findMany({
        where: {
          name: { contains: userName.toLowerCase(), mode: "insensitive" },
        },
        select: selectFields,
      }),
    ]);
    return user[0];
  } catch (error) {
    throw error;
  }
}

export async function getUserByAscent(hillId: string) {
  try {
    const user = await prisma.$transaction([
      prisma.user.findMany({
        where: { assentIDs: { has: hillId } },
        select: selectFields,
      }),
    ]);
    return user[0];
  } catch (error) {
    throw error;
  }
}
