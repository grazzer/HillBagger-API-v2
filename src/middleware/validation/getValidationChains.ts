import { body, check } from "express-validator";
import {
  validateID,
  validateName,
  validateDate as validateDateISO,
  validateDateOptional,
  validateIDOptional,
} from "./Links.js";

export const validateAscentId = [validateID("ascentId")];

export const validateGetAscentGeneral = [
  check().custom((_, { req }) => {
    const b = req.body || {};
    const hasHill = Boolean(b.hillId);
    const hasDate = Boolean(b.date);
    const hasRange = Boolean(b.startDate) && Boolean(b.endDate);
    if (!hasHill && !hasDate && !hasRange) {
      throw new Error(
        "At least one search parameter (hillId, date, startDate/endDate) is required",
      );
    }
    return true;
  }),
  validateIDOptional("hillId"),
  validateDateOptional("date"),
  body("startDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("startDate must be a valid date")
    .custom((value, { req }) => {
      if ((value && !req.body.endDate) || (!value && req.body.endDate)) {
        throw new Error("startDate and endDate must both be provided together");
      }
      return true;
    }),
  body("endDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("endDate must be a valid date"),
];

export const validateUserId = [validateID("userId")];
export const validateHillId = [validateID("hillId")];
export const validateUserName = [validateName("userName")];
