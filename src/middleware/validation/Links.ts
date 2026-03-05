import { body } from "express-validator";

export const validateEmail = body("email")
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Invalid email format");

export const validateName = (nameField: string) =>
  body(nameField)
    .notEmpty()
    .withMessage(`${nameField} is required`)
    .isString()
    .withMessage(`${nameField} must be a string`)
    .isAlpha("en-US", { ignore: "\s" })
    .withMessage(`${nameField} must not contain any numerical characters`);

export const validateID = (IdName: string) =>
  body(IdName)
    .notEmpty()
    .withMessage(`${IdName} is required`)
    .isMongoId()
    .withMessage(`${IdName} must be a 24 character hexadecimal id`);

export const validateIDOptional = (IdName: string) =>
  body(IdName)
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage(`${IdName} must be a 24 character hexadecimal id`);

export const validateDate = (dateName: string) =>
  body(dateName)
    .notEmpty()
    .withMessage(`${dateName} is required`)
    .isISO8601()
    .withMessage(`${dateName} must be a valid date`);

export const validateDateOptional = (dateName: string) =>
  body(dateName)
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage(`${dateName} must be a valid date`);
