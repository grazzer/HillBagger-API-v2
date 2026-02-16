import { body } from "express-validator";

export const email = body("email")
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Invalid email format");

export const name = body("name")
  .notEmpty()
  .withMessage("Name must be at least 1 character long");

export const validateID = (IdName: string) =>
  body(IdName)
    .notEmpty()
    .withMessage(`${IdName} is required`)
    .isHexadecimal()
    .withMessage(`${IdName} must be a hexadecimal string`)
    .isByteLength({ min: 24, max: 24 })
    .withMessage(`${IdName} must be 24 bytes long`);
