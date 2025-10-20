import { prisma } from "./connectDb.js";

export async function getProfile(userId: any) {
  try {
    const user = await prisma.$transaction([
      prisma.user.findFirst({
        where: { id: userId },
      }),
    ]);
    return user[0];
  } catch (error) {
    throw error;
  }
}
