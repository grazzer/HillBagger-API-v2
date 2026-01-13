import { body } from "express-validator";
import { ObjectId } from "mongodb";

const validateID = (IdName: string) =>
  body(IdName)
    .notEmpty()
    .withMessage(`${IdName} is required`)
    .isHexadecimal()
    .withMessage(`${IdName} must be a hexadecimal string`)
    .isByteLength({ min: 24, max: 24 })
    .withMessage(`${IdName} must be 24 bytes long`);

const validateAscent = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("date must be a valid date"),
  validateID("hillID"),
  body("time").optional().isNumeric().withMessage("time must be a number"),
  body("weather")
    .optional()
    .isString()
    .withMessage("weather must be a string")
    .isAlpha("en-US", { ignore: " ,." })
    .withMessage("must not contain any numerical characters"),
  body("distance")
    .optional()
    .isFloat()
    .withMessage("distance must be a float number"),
  body("notes").optional().isString().withMessage("notes must be a string"),
  body("photos").optional().isArray().withMessage("photos must be an array"),
  body("nonUserGroupMembers")
    .optional()
    .isArray()
    .withMessage("nonUserGroupMembers must be an array")
    .custom(async (arr) => {
      arr.forEach((id: any) => {
        if (typeof id !== typeof "string") {
          throw new Error("each nonUserGroupMembers must be a string");
        }
      });
    }),
  body("pendingGroupMembersIDs")
    .optional()
    .isArray()
    .withMessage("pendingGroupMembersIDs must be an array")
    .custom(async (arr) => {
      arr.forEach((id: any) => {
        if (ObjectId.isValid(id) === false) {
          throw new Error("each nonUserGroupMembers must be a string");
        }
      });
    }),

  // body("pendingGroupMembersIDs")
  //   .optional()
  //   .isString()
  //   .withMessage("pendingGroupMembersIDs must be a string"),
];

//TODO:
export const ValidateCreateAscent = validateAscent;

export const ValidateJoinRequest = [validateID("ascentId")];

export const ValidateRespondToJoinRequest = [
  validateID("ascentId"),
  validateID("requestedUserId"),
];

export const ValidateRemoveJoinRequest = [validateID("ascentId")];

export const ValidateRespondToInvite = [validateID("ascentId")];

export const ValidateRemoveInvitedUser = [
  validateID("ascentId"),
  validateID("removeUserId"),
];

// TODO:
export const ValidateUpdateAscent = [validateID("ascentId"), ...validateAscent];

export const ValidateLeaveAscent = [validateID("ascentId")];
