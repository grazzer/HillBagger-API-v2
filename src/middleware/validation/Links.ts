import { body } from "express-validator";

export const email = body("email")
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Invalid email format");

export const name = body("name")
  .notEmpty()
  .withMessage("Name must be at least 1 character long");
