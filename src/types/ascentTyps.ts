import type { User } from "@prisma/client";

export type AscentType = {
  id: string;
  date: string;
  hillID: string;
  time: string;
  weather: string;
  distance: number;
  notes: string;
  photos: string[];

  nonUserGroupMembers: string[];

  pendingGroupMembersIDs: string[];
  // populated when you include relation data from Prisma
  pendingGroupMembers?: User[];

  groupMembersIDs: string[];
  groupMembers?: User[];

  requestedGroupMembersIDs: string[];
  requestedGroupMembers?: User[];
};
