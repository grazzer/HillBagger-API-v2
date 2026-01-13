import e, { Request, Response, NextFunction } from "express";
import {
  createAscent,
  findSimilarAscent,
  requestJoiningAscentGroup,
  updateRequestedUserToAscent,
  removeRequestToJoinAscent,
  updatePendingUserToAscent,
  removePendingUserToAscent,
  updateAscent,
  removeUser,
  getAscentByID,
  disconnectAndDeleteAscent,
} from "../DataBase/ascentDb.js";
import { getProfile } from "../DataBase/profileDb.js";
import type { Ascent } from "@prisma/client";

// TODO: TOLEARN: should these functions check if users exist even if they have a session?

export function accept(req: Request, res: Response, next: NextFunction) {
  res.locals.acceptUser = true;
  next();
}

export function reject(req: Request, res: Response, next: NextFunction) {
  res.locals.acceptUser = false;
  next();
}

export async function handleCreateAscent(req: Request, res: Response) {
  const newAscent: Partial<Ascent> & { date: Date; hillID: string } = {
    date: new Date(req.body.date),
    hillID: req.body.hillID,
    time: Number(req.body.time),
    weather: req.body.weather,
    distance: parseFloat(req.body.distance),
    notes: req.body.notes,
    photos: req.body.photos,
    nonUserGroupMembers: req.body.nonUserGroupMembers,
    pendingGroupMembersIDs: req.body.pendingGroupMembersIDs,
  };

  const CreateAndRespond = async () => {
    const ascent = await createAscent(res.locals.userId, newAscent);
    // check if ascent was created
    if (ascent) {
      res.status(200).json({
        success: true,
        message: "Ascent created successfully",
        data: ascent,
      });
      return;
    }
    res.status(400).json({
      success: true,
      message: "unable to create new ascent",
    });
    return;
  };

  try {
    if (req.body.rejectSimilar == true) {
      CreateAndRespond();
      return;
    }
    const ascents = await findSimilarAscent(
      res.locals.userId,
      newAscent.date,
      newAscent.hillID,
      newAscent.pendingGroupMembersIDs || []
    );

    // check if similar ascents are found
    if (Array.isArray(ascents) && ascents.length > 0) {
      res.status(403).json({
        success: false,
        message: "Similar ascents have been found",
        data: ascents,
      });
      return;
    }
    CreateAndRespond();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// if similar ascents are found user can request to join existing ascent
export async function handleRequestJoinExistingAscent(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const ascent = await getAscentByID(req.body.ascentId);
    // check if ascent exists
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: `This ${req.body.ascentId} ascent cannot be found`,
      });
      return;
    }
    // check if user is already invited to the ascent
    if (ascent?.pendingGroupMembersIDs.includes(res.locals.userId)) {
      res.status(400).json({
        success: false,
        message: "User has an existing pending status with this ascent",
      });
      return;
    }
    // check if user is already a member of the ascent
    if (ascent?.groupMembersIDs.includes(res.locals.userId)) {
      res.status(400).json({
        success: false,
        message: "User is already a member of this ascent",
      });
      return;
    }
    // check if user is already a requested member of the ascent
    if (ascent?.requestedGroupMembersIDs.includes(res.locals.userId)) {
      res.status(200).json({
        success: true,
        message: "Requested to join ascent group successfully",
        data: ascent,
      });
      return;
    }
    const updatedAscent = await requestJoiningAscentGroup(
      res.locals.userId,
      req.body.ascentId
    );
    // check if user is now a requested member of the ascent
    if (updatedAscent?.requestedGroupMembersIDs.includes(res.locals.userId)) {
      res.status(200).json({
        success: true,
        message: "Requested to join ascent group successfully",
        data: updatedAscent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `unable to join ascent ${req.body.ascentId}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// TODO: TOLEARN:
// group members responding to requests to join ascent
export async function handleResponseToUserRequestingToJoinAscent(
  req: Request,
  res: Response
) {
  try {
    const ascent = await getAscentByID(req.body.ascentId);
    // check ascent exists
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: `The ascent cannot be found`,
      });
      return;
    }
    // check requestedUserId has requested to join ascent exists
    if (!ascent.requestedGroupMembersIDs.includes(req.body.requestedUserId)) {
      res.status(404).json({
        success: false,
        message: `user has not requested to join this ascent`,
      });
      return;
    }
    // check user is authorized to to accept/reject membership
    if (!ascent.groupMembersIDs.includes(res.locals.userId)) {
      res.status(401).json({
        success: false,
        message: `user is not authorized edit requests for this ascent`,
      });
      return;
    }
    // TODO: TOLEARN: should we check if requestedUserId exists?
    // // check user to join exists
    // const profile = await getProfile(req.body.requestedUserId);
    // if (!profile) {
    //   res.status(404).json({
    //     success: false,
    //     message: `the user requesting to join cannot be found`,
    //   });
    //   return;
    // }
    const updatesAscent = await updateRequestedUserToAscent(
      res.locals.acceptUser,
      res.locals.userId,
      req.body.ascentId,
      req.body.requestedUserId
    );
    // check if requestedUserId has been added as member of to ascent
    if (updatesAscent?.groupMembersIDs.includes(req.body.requestedUserId)) {
      res.status(200).json({
        success: true,
        message: "user has been added to the ascent",
        data: updatesAscent,
      });
      return;
    }
    // check if requestedUserId has been removed from request list and isn't a member
    if (
      !updatesAscent?.requestedGroupMembersIDs.includes(
        req.body.requestedUserId
      ) &&
      !updatesAscent?.groupMembersIDs.includes(req.body.requestedUserId)
    ) {
      res.status(200).json({
        success: true,
        message: "user's request to join has been rejected",
        data: updatesAscent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "No changes made to the ascent",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// user removing their request to join an ascent
export async function handleRemoveRequestToJoinAscent(
  req: Request,
  res: Response
) {
  try {
    const ascent = await getAscentByID(req.body.ascentId);
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: `This ascent cannot be found`,
      });
      return;
    }
    if (!ascent.requestedGroupMembersIDs.includes(res.locals.userId)) {
      res.status(404).json({
        success: false,
        message: `user has not requested to join this ascent`,
      });
      return;
    }
    const updatedAscent = await removeRequestToJoinAscent(
      res.locals.userId,
      req.body.ascentId
    );
    if (!updatedAscent.requestedGroupMembersIDs.includes(res.locals.userId)) {
      res.status(200).json({
        success: true,
        message: "your request to join the ascent has been removed",
        data: updatedAscent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "No changes made to the ascent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// invited users responding to invitations to join ascent
export async function handleResponseToUserInvitedToJoinAscent(
  req: Request,
  res: Response
) {
  try {
    const ascent = await getAscentByID(req.body.ascentId);
    // check ascent exists
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: "ascent cannot be found",
      });
      return;
    }
    if (!ascent.pendingGroupMembersIDs.includes(res.locals.userId)) {
      res.status(401).json({
        success: false,
        message: "user is not authorized to respond to this invitation",
      });
      return;
    }
    const updatedAscent = await updatePendingUserToAscent(
      res.locals.acceptUser,
      res.locals.userId,
      req.body.ascentId
    );
    if (updatedAscent?.groupMembersIDs.includes(res.locals.userId)) {
      res.status(200).json({
        success: true,
        message: "you have been added to the ascent",
        data: updatedAscent,
      });
      return;
    }
    if (
      !updatedAscent?.groupMembersIDs.includes(res.locals.userId) &&
      !updatedAscent?.pendingGroupMembersIDs.includes(res.locals.userId)
    ) {
      res.status(200).json({
        success: true,
        message: "you have declined the invitation to the ascent",
        data: updatedAscent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "No changes made to the ascent",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// ascent members removing invited user
export async function handleRemoveInvitedUser(req: Request, res: Response) {
  try {
    const ascent = await getAscentByID(req.body.ascentId);
    // check ascent exists
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: "ascent cannot be found",
      });
      return;
    }
    // check if user is authorized to to remove invitation
    if (!ascent.groupMembersIDs.includes(res.locals.userId)) {
      res.status(401).json({
        success: false,
        message: "user is not authorized edit this ascent",
      });
      return;
    }
    // check if removeUserId is invited to the ascent
    if (!ascent.pendingGroupMembersIDs.includes(req.body.removeUserId)) {
      res.status(404).json({
        success: false,
        message: "the invited user cannot be found on this ascent",
      });
      return;
    }
    const updatedAscent = await removePendingUserToAscent(
      res.locals.userId,
      req.body.ascentId,
      req.body.removeUserId
    );
    // check if user was removed from invited list
    if (!updatedAscent.pendingGroupMembersIDs.includes(req.body.removeUserId)) {
      res.status(200).json({
        success: true,
        message: "the invited user has been removed from the ascent",
        data: updatedAscent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "No changes made to the ascent",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// update ascent details, notes, photos, weather etc. including adding new group invitations
export async function handleUpdateAscent(req: Request, res: Response) {
  try {
    const newAscent: Partial<Ascent> & {
      id: string;
      date: Date;
      hillID: string;
    } = {
      id: req.body.ascentId,
      date: new Date(req.body.date),
      hillID: req.body.hillID,
      time: Number(req.body.time),
      weather: req.body.weather,
      distance: parseFloat(req.body.distance),
      notes: req.body.notes,
      photos: req.body.photos,
      nonUserGroupMembers: req.body.nonUserGroupMembers,
      pendingGroupMembersIDs: req.body.pendingGroupMembersIDs,
    };
    const ascent = await getAscentByID(newAscent.id);
    // check if ascent exists
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: "Ascent not found",
      });
      return;
    }
    // check if user is authorized to to edit the ascent
    if (!ascent.groupMembersIDs.includes(res.locals.userId)) {
      res.status(401).json({
        success: false,
        message: "user is not authorized to edit this ascent",
      });
      return;
    }
    const updatedAscent = await updateAscent(res.locals.userId, newAscent);
    console.log(updatedAscent);
    if (updatedAscent != undefined) {
      res.status(200).json({
        success: true,
        message: "Ascent Updated",
        data: updatedAscent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "No changes made to the ascent",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// user removing them selfs from an ascent, if last to leave the ascent is deleted
export async function handleLeaveAscent(req: Request, res: Response) {
  try {
    const ascent = await getAscentByID(req.body.ascentId);
    // check if ascent exists
    if (!ascent) {
      res.status(404).json({
        success: false,
        message: "could not find ascent",
      });
      return;
    }
    // check if user is eligible to edit the ascent
    if (!ascent.groupMembersIDs.includes(res.locals.userId)) {
      res.status(401).json({
        success: false,
        message: "user is not a member of this ascent",
      });
      return;
    }

    const removedAscent = await removeUser(
      res.locals.userId,
      req.body.ascentId
    );
    // check user was if last member of the ascent
    if (removedAscent.groupMembersIDs.length == 0) {
      await CleanDeleteAscent(req.body.ascentId, ascent);
      res.status(200).json({
        success: true,
        message: "you have left the ascent and the was ascent deleted",
      });
      return;
    }

    if (!removedAscent.groupMembersIDs.includes(res.locals.userId)) {
      res.status(200).json({
        success: true,
        message: "you have left the ascent",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "could not remove user from ascent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

// helper function to cleanly delete an ascent and disconnect all related users
async function CleanDeleteAscent(ascentId: string, ascent: Ascent) {
  try {
    const UserIdsToDisconnect = Array.from(
      new Set([
        ...(ascent.pendingGroupMembersIDs ?? []),
        ...(ascent.requestedGroupMembersIDs ?? []),
      ])
    );

    await disconnectAndDeleteAscent(ascentId, UserIdsToDisconnect);
    return;
  } catch (error) {}
}
