import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { connect } from "http2";

const prisma = new PrismaClient({
  omit: {
    user: { password: true },
  },
});

async function authorizeUser(userEmail: string) {
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

async function registerUser(
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

async function getUserById(userId: any) {
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

// friends
async function connectFriend(userId: string, friendId: string) {
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

async function disconnectFriend(userId: string, friendId: string) {
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

async function requestFriendConnection(userId: string, friendId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        FriendRequestsSent: { connect: [{ id: friendId }] },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function requestFriendDisconnection(userId: string, friendId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        FriendRequestsReceived: { disconnect: [{ id: friendId }] },
        FriendRequestsSent: { disconnect: [{ id: friendId }] },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function addBlockedUser(userId: string, blockedId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        FriendRequestsReceived: { disconnect: [{ id: blockedId }] },
        FriendRequestsSent: { disconnect: [{ id: blockedId }] },
        friends: { disconnect: [{ id: blockedId }] },
        BlockedUserIDs: { push: blockedId },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function removeBlockedUser(userId: string, blockedIds: string[]) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        BlockedUserIDs: { set: blockedIds },
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export {
  authorizeUser,
  registerUser,
  getUserById,
  connectFriend,
  disconnectFriend,
  requestFriendConnection,
  requestFriendDisconnection,
  addBlockedUser,
  removeBlockedUser,
  prisma,
};
