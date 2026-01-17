import { body } from "express-validator";
import { email, name } from "./Links.js";

export const ValidateLogin = [
  email,
  body("password").notEmpty().withMessage("Password is required"),
];

export const ValidateRegistration = [
  email,
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"
    ),
  name,
];
