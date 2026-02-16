import { User } from "@prisma/client";
import { prisma } from "./connectDb.js";
import bcrypt from "bcrypt";
import { sessionLogger } from "../logging/Loggers.js";

export async function authorizeUser(userEmail: string): Promise<User | null> {
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
    sessionLogger.error("error authorize user Db:", error);
    throw error;
  }
}

export async function registerUser(
  userName: string,
  userEmail: string,
  password: string,
): Promise<User> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        password: hashedPassword,
        photo: null,
      },
    });
    return user;
  } catch (error) {
    sessionLogger.error("error register user Db:", error);
    throw error;
  }
}
