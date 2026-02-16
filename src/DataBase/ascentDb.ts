import { sessionLogger } from "../logging/Loggers.js";
import { prisma } from "./connectDb.js";
import type { Ascent } from "@prisma/client";

export async function getAscentByID(ascentId: string): Promise<any> {
  try {
    const ascent = await prisma.ascent.findFirst({
      where: {
        id: ascentId,
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error getUserById Db:", error);
  }
}

export async function createAscent(
  userId: string,
  newAscent: Partial<Ascent> & {
    hillID: string;
    date: Date;
  },
): Promise<Ascent> {
  const data: any = {
    date: newAscent.date,
    hillID: newAscent.hillID,
    time: newAscent.time || 0,
    weather: newAscent.weather || "",
    distance: newAscent.distance || 0,
    notes: newAscent.notes || "",
    photos: newAscent.photos || [],
    nonUserGroupMembers: newAscent.nonUserGroupMembers || [],
    pendingGroupMembers: {},
    groupMembers: {
      connect: [{ id: userId }],
    },
  };
  if (
    Array.isArray(newAscent.pendingGroupMembersIDs) &&
    newAscent.pendingGroupMembersIDs.length > 0
  ) {
    data.pendingGroupMembers = {
      connect: newAscent.pendingGroupMembersIDs.map((id) => ({ id })),
    };
  }
  try {
    const ascent = await prisma.ascent.create({
      data,
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error create ascent Db:", error);
    throw error;
  }
}

export async function findSimilarAscent(
  userId: string,
  date: Date,
  hillID: string,
  groupMembersIDs: string[],
): Promise<Ascent[]> {
  try {
    const ascent = await prisma.ascent.findMany({
      where: {
        hillID: hillID,
        date: date,
        OR: [
          {
            OR: [
              { pendingGroupMembersIDs: { hasSome: groupMembersIDs } },
              { groupMembersIDs: { hasSome: groupMembersIDs } },
            ],
          },
          {
            OR: [
              { pendingGroupMembersIDs: { has: userId } },
              { groupMembersIDs: { has: userId } },
            ],
          },
        ],
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error find similar ascent Db:", error);
    throw error;
  }
}

export async function requestJoiningAscentGroup(
  userId: string,
  ascentId: string,
): Promise<Ascent> {
  try {
    const ascent = await prisma.ascent.update({
      where: {
        id: ascentId,
      },
      data: {
        requestedGroupMembers: { connect: { id: userId } },
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error requesting join ascent Db:", error);
    throw error;
  }
}

export async function removeRequestToJoinAscent(
  userId: string,
  ascentId: string,
): Promise<Ascent> {
  try {
    const ascent = await prisma.ascent.update({
      where: {
        id: ascentId,
      },
      data: {
        requestedGroupMembers: { disconnect: { id: userId } },
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error remove request to join Db:", error);
    throw error;
  }
}

export async function updateRequestedUserToAscent(
  acceptUser: boolean = true, // conditional to add or remove member
  userId: string,
  ascentId: string,
  userIdToAdd: string,
): Promise<Ascent> {
  try {
    const data = {
      requestedGroupMembers: { disconnect: { id: userIdToAdd } },
      groupMembers: {},
    };
    if (acceptUser) {
      data.groupMembers = { connect: { id: userIdToAdd } };
    }
    const ascent = await prisma.ascent.update({
      where: {
        id: ascentId,
        groupMembersIDs: { has: userId }, // ensure user is eligible to edit the ascent
        requestedGroupMembersIDs: { has: userIdToAdd },
      },
      data,
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error updating request user to ascent Db:", error);
    throw error;
  }
}

export async function updatePendingUserToAscent(
  acceptUser: boolean,
  userId: string,
  ascentId: string,
): Promise<Ascent> {
  try {
    const data: any = {
      pendingGroupMembers: { disconnect: { id: userId } },
      groupMembers: {},
    };
    if (acceptUser) {
      data.groupMembers = { connect: { id: userId } };
    }
    const ascent = await prisma.ascent.update({
      where: {
        id: ascentId,
        pendingGroupMembersIDs: { has: userId }, // ensure user is invited to the ascent
      },
      data,
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error updatePendingUserToAscent Db:", error);
    throw error;
  }
}

export async function removePendingUserToAscent(
  userId: string,
  ascentId: string,
  removeUserID: string,
): Promise<Ascent> {
  try {
    const ascent = await prisma.ascent.update({
      where: {
        id: ascentId,
        groupMembersIDs: { has: userId }, // ensure user is eligible to edit the ascent
        pendingGroupMembersIDs: { has: removeUserID },
      },
      data: {
        pendingGroupMembers: { disconnect: { id: removeUserID } },
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error removePendingUserToAscent Db:", error);
    throw error;
  }
}

export async function updateAscent(
  userId: string,
  newAscent: Partial<Ascent>,
): Promise<Ascent> {
  const data = {
    date: newAscent.date,
    hillID: newAscent.hillID,
    time: newAscent.time !== undefined ? newAscent.time : 0,
    weather: newAscent.weather !== undefined ? newAscent.weather : "",
    distance: newAscent.distance !== undefined ? newAscent.distance : 0,
    notes: newAscent.notes !== undefined ? newAscent.notes : "",
    photos: newAscent.photos !== undefined ? newAscent.photos : [""],
    nonUserGroupMembers:
      newAscent.nonUserGroupMembers !== undefined
        ? newAscent.nonUserGroupMembers
        : [""],
    pendingGroupMembers: {},
  };
  if (newAscent.pendingGroupMembersIDs !== undefined) {
    data.pendingGroupMembers = {
      connect: newAscent.pendingGroupMembersIDs.map((id) => ({ id: id })),
    };
  }
  try {
    const ascent = await prisma.ascent.update({
      where: {
        id: newAscent.id,
        groupMembersIDs: { has: userId },
      },
      data,
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error update Ascent Db:", error);
    throw error;
  }
}

export async function removeUser(
  userId: string,
  ascentId: string,
): Promise<Ascent> {
  try {
    const ascent = await prisma.ascent.update({
      where: {
        id: ascentId,
      },
      data: {
        groupMembers: { disconnect: { id: userId } },
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error remove User Db:", error);
    throw error;
  }
}

export async function disconnectAndDeleteAscent(
  ascentId: string,
  UserIdsToDisconnect: string[],
): Promise<void> {
  try {
    const updates = UserIdsToDisconnect.map((userId) =>
      prisma.ascent.update({
        where: { id: ascentId },
        data: {
          pendingGroupMembers: { disconnect: { id: userId } },
          requestedGroupMembers: { disconnect: { id: userId } },
        },
      }),
    );

    await prisma.$transaction([
      ...updates,
      prisma.ascent.delete({ where: { id: ascentId } }),
    ]);
    return;
  } catch (error) {
    sessionLogger.error("error disconnect and delete ascent Db:", error);
    throw error;
  }
}
