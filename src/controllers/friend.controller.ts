import { Request, Response } from "express";
import {
  getUserById,
  connectFriend,
  requestFriendConnection,
  requestFriendDisconnection,
  disconnectFriend,
  addBlockedUser,
  removeBlockedUser,
} from "../DataBase/friendsDb.js";
import { sessionLogger } from "../logging/Loggers.js";

// send a friend request
export async function HandleFriendRequest(req: Request, res: Response) {
  const { friendId } = req.body;
  const userId = res.locals.userId;

  if (req.body.friendId == userId) {
    res.status(400).json({
      success: false,
      message: "You cannot send a friend request to yourself",
    });
    return;
  }
  try {
    const friend = await getUserById(friendId);
    // check friend exists
    if (!friend) {
      res.status(404).json({
        success: false,
        message: "friend not found",
      });
      return;
    }
    // check user is not blocked
    if (friend.blockedUserIDs.includes(userId)) {
      res.status(403).json({
        success: false,
        message: "you cannot send this user a friend request",
      });
      return;
    }
    // check if not already friends
    if (friend.friendIDs.includes(userId)) {
      res.status(400).json({
        success: false,
        message: "You are already friends with this user",
      });
      return;
    }
    const user = await getUserById(userId);
    // check if user is not blocking friend
    if (user?.blockedUserIDs.includes(friendId)) {
      res.status(403).json({
        success: false,
        message: "You have blocked this user",
      });
      return;
    }
    const userWithNewFriend = await requestFriendConnection(userId, friendId);

    // check if friend is added to user
    if (userWithNewFriend.friendRequestsSentIDs.includes(friendId)) {
      res.status(200).json({
        success: true,
        message: "friend request sent",
        data: userWithNewFriend,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "no changes made",
    });
  } catch (error) {
    sessionLogger.error("Error creating friend request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// reject or accept friend request
export async function HandleFriendRequestResponse(req: Request, res: Response) {
  try {
    const { friendId } = req.body;
    const { userId, acceptUser } = res.locals;

    // check friend exists
    const friend = await getUserById(friendId);
    if (!friend) {
      res.status(404).json({
        success: false,
        message: "friend not found",
      });
      return;
    }
    // check friend request exists
    if (friend.friendRequestsSentIDs.includes(userId) == false) {
      res.status(404).json({
        success: false,
        message: "you do not have a valid friend request from this user",
      });
      return;
    }

    //disconnect friend request
    let user = await requestFriendDisconnection(userId, friendId);
    // if accepting request then connect friends
    if (acceptUser == true) {
      user = await connectFriend(userId, friendId);
    }
    //check results
    if (
      !user.friendRequestsReceivedIDs.includes(friendId) &&
      user.friendIDs.includes(friendId)
    ) {
      res.status(200).json({
        success: true,
        message: "friend request accepted",
        data: user,
      });
      return;
    }
    if (!user.friendRequestsReceivedIDs.includes(friendId)) {
      res.status(200).json({
        success: true,
        message: "friend request removed",
        data: user,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "no changes made",
    });
  } catch (error) {
    sessionLogger.error("error responding to friend request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// decline friend request
export async function HandleRemoveFriendRequest(req: Request, res: Response) {
  try {
    const { friendId } = req.body;
    const userId = res.locals.userId;

    const user = await requestFriendDisconnection(userId, friendId);
    if (!user.friendRequestsSentIDs.includes(friendId)) {
      res.status(200).json({
        success: true,
        message: "friend request removed",
        data: user,
      });
      return;
    }
    res.status(400).json({
      success: true,
      message: "no changes were made",
      data: user,
    });
  } catch (error) {
    sessionLogger.error("error removing friend request", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// unfriend
export async function HandleRemoveFriend(req: Request, res: Response) {
  try {
    const { friendId } = req.body;
    const userId = res.locals.userId;

    const friend = await getUserById(friendId);
    if (!friend) {
      res.status(404).json({
        success: true,
        message: "friend to disconnect not found",
      });
      return;
    }

    const user = await disconnectFriend(userId, friendId);
    if (!user?.friendIDs.includes(friendId)) {
      res.status(200).json({
        success: true,
        data: user,
        message: "friend removed",
      });
      return;
    }
    res.status(400).json({
      success: true,
      message: "no changes made",
    });
  } catch (error) {
    sessionLogger.error("error removing friend", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// block user
export async function HandleBlockUser(req: Request, res: Response) {
  try {
    const { blockUserId } = req.body;
    const userId = res.locals.userId;

    if (blockUserId == userId) {
      res.status(409).json({
        success: false,
        message: "cannot block yourself",
      });
      return;
    }

    const user = await getUserById(userId);
    // check if user is already blocked
    const index = user?.blockedUserIDs.findIndex(
      (ID: string) => ID === req.body.blockUserId,
    );
    if (index != -1) {
      res.status(409).json({
        success: false,
        message: "user is already blocked",
      });
      return;
    }

    // check user to block exists
    const userToBlock = await getUserById(blockUserId);
    if (!userToBlock) {
      res.status(404).json({
        success: false,
        message: "could not find user to block",
      });
      return;
    }

    //block user and remove all friend connections
    const updatedUser = await addBlockedUser(userId, blockUserId);
    if (updatedUser.blockedUserIDs.includes(blockUserId)) {
      res.status(200).json({
        success: true,
        message: "user blocked",
        data: updatedUser,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "no changes made",
    });
  } catch (error) {
    sessionLogger.error("error blocking user", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// unblock user
export async function HandleUnblockUser(req: Request, res: Response) {
  try {
    const { blockUserId } = req.body;
    const userId = res.locals.userId;

    if (blockUserId == userId) {
      res.status(409).json({
        success: false,
        message: "cannot unblock yourself",
      });
      return;
    }

    const user = await getUserById(res.locals.userId);
    if (!user) {
      sessionLogger.error("authenticated user not found");
      new Error("authenticated in user not found");
    }
    if (!user?.blockedUserIDs.includes(req.body.blockUserId)) {
      res.status(409).json({
        success: true,
        message: "This user was not blocked",
        data: user,
      });
      return;
    }

    const index = user.blockedUserIDs.findIndex(
      (ID: string) => ID === req.body.blockUserId,
    );

    const newBlockedList = user.blockedUserIDs;
    newBlockedList.splice(index, 1);
    const updatedUser = await removeBlockedUser(
      res.locals.userId,
      newBlockedList,
    );
    if (!updatedUser.blockedUserIDs.includes(req.body.blockUserId)) {
      res.status(200).json({
        success: true,
        message: "user unblocked",
        data: updatedUser,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "No changes were made",
    });
  } catch (error) {
    sessionLogger.error("error blocking user", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
