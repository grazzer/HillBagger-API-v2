// return types for getUserById, getUserByName, and getUserByAscent
import { Ascent, User } from "@prisma/client";

export type UserPublic = Pick<
  User,
  "id" | "name" | "photo" | "friendIDs" | "ascentIDs"
>;

export type AscentPublic = Omit<
  Ascent,
  | "notes"
  | "photos"
  | "nonUserGroupMembers"
  | "pendingGroupMembersIDs"
  | "groupMembersIDs"
  | "requestedGroupMembersIDs"
>;
