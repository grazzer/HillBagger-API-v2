import { body } from "express-validator";

const ValidateRegistration = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"
    ),
  body("name").notEmpty().withMessage("Name must be at least 1 character long"),
];

export default ValidateRegistration;
