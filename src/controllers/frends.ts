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

// send a friend request
async function HandleFriendRequest(req: Request, res: Response) {
  if (req.body.friendId == res.locals.userId) {
    res.status(400).json({
      success: false,
      message: "You cannot send a friend request to yourself",
    });
    return;
  }
  try {
    getUserById(req.body.friendId).then((friend) => {
      if (friend) {
        if (friend.BlockedUserIDs.includes(res.locals.userId) == false) {
          getUserById(res.locals.userId).then((user) => {
            if (user?.BlockedUserIDs.includes(req.body.friendId) == false) {
              if (friend.friendIDs.includes(res.locals.userId) == false) {
                requestFriendConnection(
                  res.locals.userId,
                  req.body.friendId
                ).then((user) => {
                  return res.status(200).json({
                    success: true,
                    message: "friend request sent",
                    data: user,
                  });
                });
              } else {
                res.status(400).json({
                  success: false,
                  message: "You are already friends with this user",
                });
              }
            } else {
              res.status(403).json({
                success: false,
                message: "You have blocked this user",
              });
            }
          });
        } else {
          res.status(403).json({
            success: false,
            message: "You are blocked by this user",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "friend not found",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// remove friend request
async function HandleRemoveFriendRequest(req: Request, res: Response) {
  try {
    getUserById(res.locals.userId).then((user) => {
      if (user?.FriendRequestsSentIDs.includes(req.body.friendId) == true) {
        requestFriendDisconnection(res.locals.userId, req.body.friendId).then(
          (user) => {
            return res.status(200).json({
              success: true,
              message: "friend request removed",
              data: user,
            });
          }
        );
      } else {
        res.status(404).json({
          success: false,
          message: "there is no friend request to this user",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// accept friend request
async function HandleAcceptFriendRequest(req: Request, res: Response) {
  //TODO:  check if request exists
  try {
    getUserById(res.locals.userId).then((user) => {
      if (user?.FriendRequestsReceivedIDs.includes(req.body.friendId)) {
        requestFriendDisconnection(res.locals.userId, req.body.friendId).then(
          () => {
            connectFriend(res.locals.userId, req.body.friendId).then((user) => {
              res.status(200).json({
                success: true,
                message: "friend request accepted",
                data: user,
              });
            });
          }
        );
      } else {
        res.status(404).json({
          success: false,
          message: "No friend request from this user",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// decline friend request
// TODO: is this needed?
async function HandleRejectFriendRequest(req: Request, res: Response) {
  try {
    await requestFriendDisconnection(res.locals.userId, req.body.friendId).then(
      (user) => {
        return res.status(200).json({
          success: true,
          message: "friend request removed",
          data: user,
        });
      }
    );
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// remove friend
async function HandleRemoveFriend(req: Request, res: Response) {
  try {
    disconnectFriend(res.locals.userId, req.body.friendId).then((user) => {
      return res.status(200).json({
        success: true,
        data: user,
        message: "friend removed",
      });
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// block user
async function HandleBlockUser(req: Request, res: Response) {
  try {
    getUserById(res.locals.userId).then((user) => {
      if (user) {
        const index = user.BlockedUserIDs.findIndex(
          (ID: string) => ID === req.body.blockUserId
        );
        if (index == -1) {
          addBlockedUser(res.locals.userId, req.body.blockUserId).then(
            (user) => {
              return res.status(200).json({
                success: true,
                message: "user blocked",
                data: user,
              });
            }
          );
        } else {
          res.status(409).json({
            success: false,
            message: "user is already blocked",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// unblock user
async function HandleUnblockUser(req: Request, res: Response) {
  try {
    getUserById(res.locals.userId).then((user) => {
      if (user) {
        const index = user.BlockedUserIDs.findIndex(
          (ID: string) => ID === req.body.blockUserId
        );
        if (index >= 0) {
          const newBlockedList = user.BlockedUserIDs;
          newBlockedList.splice(index, 1);
          removeBlockedUser(res.locals.userId, newBlockedList).then((user) => {
            return res.status(200).json({
              success: true,
              message: "user is no longer blocked",
              data: user,
            });
          });
        } else {
          res.status(404).json({
            success: false,
            message: "This user was not blocked",
          });
        }
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export {
  HandleRemoveFriend,
  HandleFriendRequest,
  HandleRemoveFriendRequest,
  HandleAcceptFriendRequest,
  HandleRejectFriendRequest,
  HandleBlockUser,
  HandleUnblockUser,
};
