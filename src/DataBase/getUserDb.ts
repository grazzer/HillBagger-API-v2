import { prisma } from "./connectDb.js";
import { UserPublic } from "../types/publicGetByTypes.js";
import { logger } from "../logging/Loggers.js";

const selectFields = {
  id: true,
  name: true,
  photo: true,
  friendIDs: true,
  ascentIDs: true,
};

export async function getUserById(userId: string): Promise<UserPublic[]> {
  try {
    const user = await prisma.user.findMany({
      where: { id: userId },
      select: selectFields,
    });

    return user;
  } catch (error) {
    logger.error("error getting user by Id Db:", error);
    throw error;
  }
}

export async function getUserByName(userName: string): Promise<UserPublic[]> {
  try {
    const user = await prisma.user.findMany({
      where: {
        name: { contains: userName.toLowerCase(), mode: "insensitive" },
      },
      select: selectFields,
    });
    return user;
  } catch (error) {
    logger.error("error getting user by name Db:", error);
    throw error;
  }
}

export async function getUserByAscent(hillId: string): Promise<UserPublic[]> {
  try {
    const user = await prisma.user.findMany({
      where: { ascentIDs: { has: hillId } },
      select: selectFields,
    });
    return user;
  } catch (error) {
    logger.error("error getting user by ascent Db:", error);
    throw error;
  }
}
