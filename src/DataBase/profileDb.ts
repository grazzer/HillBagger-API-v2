import { promises } from "dns";
import { sessionLogger } from "../logging/Loggers.js";
import { prisma } from "./connectDb.js";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

export async function getProfile(userId: any): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    return user;
  } catch (error) {
    sessionLogger.error("error getProfile Db:", error);
    throw error;
  }
}

interface ascentInfo {
  id: string;
  users: string[];
}

// Delete user and clean up all relations, including cleaning and deleting ascents where user is the only member
export async function disconnectAndDeleteUser(
  userId: string,
  friendsToDisconnect: string[],
  ascentsToDisconnect: string[],
  ascentIdsToDelete: ascentInfo[],
): Promise<string> {
  try {
    const cleanAscentsToDelete = [];

    for (const ascent of ascentIdsToDelete) {
      const cleanAscents = ascent.users.map((user) =>
        prisma.ascent.update({
          where: { id: ascent.id },
          data: {
            groupMembers: { disconnect: { id: user } },
            pendingGroupMembers: { disconnect: { id: user } },
            requestedGroupMembers: { disconnect: { id: user } },
          },
        }),
      );
      cleanAscentsToDelete.push(...cleanAscents);
    }

    const deleteAscents = ascentIdsToDelete.map((ascent) =>
      prisma.ascent.delete({ where: { id: ascent.id } }),
    );

    const cleanUserFriends = friendsToDisconnect.map((friendId) =>
      prisma.user.update({
        where: { id: userId },
        data: {
          friends: { disconnect: { id: friendId } },
          copyFriends: { disconnect: [{ id: friendId }] },
          friendRequestsReceived: { disconnect: { id: friendId } },
          friendRequestsSent: { disconnect: { id: friendId } },
        },
      }),
    );
    const cleanUserAscents = ascentsToDisconnect.map((ascentId) =>
      prisma.user.update({
        where: { id: userId },
        data: {
          ascents: { disconnect: { id: ascentId } },
          pendingAscents: { disconnect: { id: ascentId } },
          requestedAscents: { disconnect: { id: ascentId } },
        },
      }),
    );

    await prisma.$transaction([
      ...cleanUserFriends,
      ...cleanUserAscents,
      ...cleanAscentsToDelete,
      ...deleteAscents,
      prisma.user.delete({ where: { id: userId } }),
    ]);
    return "User deleted successfully";
  } catch (error) {
    sessionLogger.error("error disconnectAndDeleteUser Db:", error);
    throw error;
  }
}

export async function updateUserPassword(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return true;
  } catch (error) {
    sessionLogger.error("error updateUserPassword Db:", error);
    throw error;
  }
}
