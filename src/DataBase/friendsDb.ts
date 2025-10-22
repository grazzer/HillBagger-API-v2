import { prisma } from "./connectDb.js";

// for internal use only for checking blocked users and friend request lists
export async function getUserById(userId: any) {
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

export async function connectFriend(userId: string, friendId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        friends: { connect: [{ id: friendId }] },
      },
    });
    await prisma.user.update({
      where: { id: friendId },
      data: {
        friends: { connect: [{ id: userId }] },
      },
    });
    return user;
  } catch (error) {}
}

export async function disconnectFriend(userId: string, friendId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        friends: { disconnect: [{ id: friendId }] },
      },
    });
    await prisma.user.update({
      where: { id: friendId },
      data: {
        friends: { disconnect: [{ id: userId }] },
      },
    });
    return user;
  } catch (error) {}
}

export async function requestFriendConnection(
  userId: string,
  friendId: string
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        friendRequestsSent: { connect: [{ id: friendId }] },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function requestFriendDisconnection(
  userId: string,
  friendId: string
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        friendRequestsReceived: { disconnect: [{ id: friendId }] },
        friendRequestsSent: { disconnect: [{ id: friendId }] },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function addBlockedUser(userId: string, blockedId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        friendRequestsReceived: { disconnect: [{ id: blockedId }] },
        friendRequestsSent: { disconnect: [{ id: blockedId }] },
        friends: { disconnect: [{ id: blockedId }] },
        blockedUserIDs: { push: blockedId },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function removeBlockedUser(userId: string, blockedIds: string[]) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        blockedUserIDs: { set: blockedIds },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
