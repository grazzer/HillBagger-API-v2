import { sessionLogger } from "../logging/Loggers.js";
import { prisma } from "./connectDb.js";
import { AscentPublic } from "../types/publicGetByTypes.js";

const omitConfig = {
  notes: true,
  photos: true,
  nonUserGroupMembers: true,
  pendingGroupMembersIDs: true,
  groupMembersIDs: true,
  requestedGroupMembersIDs: true,
};

export async function getAscentByID(ascentId: string): Promise<AscentPublic[]> {
  try {
    const ascent = await prisma.ascent.findMany({
      omit: omitConfig,
      where: {
        id: ascentId,
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error get user by Id public Db:", error);
    throw error;
  }
}

export async function getAscentByHillID(
  hillId: string,
): Promise<AscentPublic[]> {
  try {
    const ascent = await prisma.ascent.findMany({
      omit: omitConfig,
      where: {
        hillID: hillId,
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error get user by hill Id public Db:", error);
    throw error;
  }
}

export async function getAscentByDate(date: Date): Promise<AscentPublic[]> {
  try {
    const ascent = await prisma.ascent.findMany({
      omit: omitConfig,
      where: {
        date: date,
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error get user by date public Db:", error);
    throw error;
  }
}

export async function getAscentByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<AscentPublic[]> {
  try {
    const ascents = prisma.ascent.findMany({
      omit: omitConfig,
      where: { date: { gte: startDate, lte: endDate } },
    });

    return ascents;
  } catch (error) {
    sessionLogger.error("error get user by date public Db:", error);
    throw error;
  }
}

export async function getAscentByHillAndDate(
  hillId: string,
  date: Date,
): Promise<AscentPublic[]> {
  try {
    const ascent = await prisma.ascent.findMany({
      omit: omitConfig,
      where: {
        date: date,
        hillID: hillId,
      },
    });
    return ascent;
  } catch (error) {
    sessionLogger.error("error get user by date public Db:", error);
    throw error;
  }
}

export async function getAscentByHillAndDateRange(
  hillId: string,
  startDate: Date,
  endDate: Date,
): Promise<AscentPublic[]> {
  try {
    const ascents = await prisma.ascent.findMany({
      omit: omitConfig,
      where: { date: { gte: startDate, lte: endDate }, hillID: hillId },
    });

    return ascents;
  } catch (error) {
    sessionLogger.error("error get user by date public Db:", error);
    throw error;
  }
}
