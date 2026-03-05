import { body } from "express-validator";

export const stringField = (nameField: string) =>
  body(nameField)
    .optional()
    .isString()
    .withMessage("Classification must be a string");

export const ValidateSearchHills = [
  stringField("classification"),
  stringField("search"),
  stringField("direction"),
  body("pagination")
    .optional()
    .toInt()
    .isInt({ min: 0 })
    .withMessage("Pagination must be a non-negative integer"),
];
