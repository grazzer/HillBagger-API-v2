import { body } from "express-validator";

export const validateFriendID = [
  body("friendId")
    .notEmpty()
    .withMessage("friendId is required")
    .isHexadecimal()
    .withMessage("friendId must be a hexadecimal string")
    .isByteLength({ min: 24, max: 24 })
    .withMessage("friendId must be 24 bytes long"),
];

export const validateBlockUserID = [
  body("blockUserId")
    .notEmpty()
    .withMessage("blockUserId is required")
    .isHexadecimal()
    .withMessage("blockUserId must be a hexadecimal string")
    .isByteLength({ min: 24, max: 24 })
    .withMessage("blockUserId must be 24 bytes long"),
];

// export default {ValidateFriendID, ValidateBlockUserID};
