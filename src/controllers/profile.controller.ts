import { Request, Response } from "express";
import { getProfile, disconnectAndDeleteUser } from "../DataBase/profileDb.js";
import { getAscentByID } from "../DataBase/ascentDb.js";
import { getUserById } from "../DataBase/userDb.js";
import { Ascent, User } from "@prisma/client";
import { logger, sessionLogger } from "../logging/Loggers.js";

interface ascentInfo {
  id: string;
  users: string[];
}

export async function HandleGetProfile(req: Request, res: Response) {
  try {
    const user = await getProfile(res.locals.userId);
    if (user) {
      res.status(200).json({
        success: true,
        message: "User found",
        data: user,
      });
      return;
    }
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  } catch (error) {
    sessionLogger.error("Error getting profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function HandleDeleteUser(req: Request, res: Response) {
  try {
    const user = await getProfile(res.locals.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    const response = await CleanAndDeleteUser(res.locals.userId, user);
    if (response == "User deleted successfully") {
      res.status(200).json({
        success: true,
        message: response,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "unable to delete user",
    });
  } catch (error) {
    logger.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// TODO: not implemented yet

// TODO: create forgot password flow once researched
export async function HandleForgotPassword(req: Request, res: Response) {}

// TODO: update function when changeable details are decided
export async function HandleUpdateUserInfo(req: Request, res: Response) {}

// helper function to cleanly delete a user and all its relations
async function CleanAndDeleteUser(userId: string, user: Partial<User>) {
  try {
    const ascentMemberIds = user.ascentIDs ?? [];
    const ascentIdsToLeave: string[] = [];
    const ascentIdsToDelete: string[] = [];
    const ascentsToDelete: ascentInfo[] = [];

    // find which ascents only contain user as member
    if (ascentMemberIds.length >= 1) {
      for (const ascentId of ascentMemberIds) {
        const ascent: Ascent = await getAscentByID(ascentId);
        if (ascent.groupMembersIDs?.length == 1) {
          ascentIdsToDelete.push(ascentId);
        } else {
          ascentIdsToLeave.push(ascentId);
        }
      }
    }

    // get id from all associated users to solo member ascents
    if (ascentIdsToDelete.length >= 1) {
      for (const ascentId of ascentIdsToDelete) {
        const ascent = await getAscentByID(ascentId);
        const usersInAscentToDisconnect: string[] = Array.from(
          new Set([
            ...(ascent.pendingGroupMembersIDs ?? []),
            ...(ascent.requestedGroupMembersIDs ?? []),
          ]),
        );
        const info: ascentInfo = {
          id: ascentId,
          users: usersInAscentToDisconnect,
        };
        ascentsToDelete.push(info);
      }
    }

    // get user from all multi-member ascents
    const ascentIdsToDisconnect = Array.from(
      new Set([
        ...(ascentIdsToLeave ?? []),
        ...(user.requestedAscentIDs ?? []),
        ...(user.pendingAscentIDs ?? []),
      ]),
    );

    // get all associated friend
    const friendIdsToDisconnect = Array.from(
      new Set([
        ...(user.friendIDs ?? []),
        ...(user.friendRequestsReceivedIDs ?? []),
        ...(user.friendRequestsSentIDs ?? []),
      ]),
    );

    const response = await disconnectAndDeleteUser(
      userId,
      friendIdsToDisconnect,
      ascentIdsToDisconnect,
      ascentsToDelete,
    );
    return response;
  } catch (error) {
    logger.error("Error delete user:", error);
    throw error;
  }
}
