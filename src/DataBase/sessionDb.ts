import { prisma } from "./connectDb.js";
import bcrypt from "bcrypt";

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return "User deleted successfully";
  } catch (error) {
    throw error;
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return true;
  } catch (error) {
    throw error;
  }
}
