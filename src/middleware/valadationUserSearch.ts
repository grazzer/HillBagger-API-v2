import { body, oneOf } from "express-validator";

export const validateUserSearchID = [
  body("userId")
    .notEmpty()
    .withMessage("userId is required")
    .isHexadecimal()
    .withMessage("userId must be a hexadecimal string")
    .isByteLength({ min: 24, max: 24 })
    .withMessage("userId must be 24 bytes long"),
];
export const validateUserSearchName = [
  body("userName")
    .notEmpty()
    .withMessage("userName is required")
    .isString()
    .withMessage("userName must be a string")
    .isLength({ min: 3 }),
];
export const validateUserSearchAscent = [
  body("hillId")
    .notEmpty()
    .withMessage("hillId is required")
    .isHexadecimal()
    .withMessage("hillId must be a hexadecimal string")
    .isByteLength({ min: 24, max: 24 })
    .withMessage("hillId must be 24 bytes long"),
];
