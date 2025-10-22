import express from "express";
import {
  handleUserById,
  handleUserByAscent,
  handleUserByName,
} from "../controllers/user.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";
import {
  validateUserSearchID,
  validateUserSearchName,
  validateUserSearchAscent,
} from "../middleware/valadationUserSearch.js";

const router = express.Router();

router.get(
  "/getUser/ById",
  validateUserSearchID,
  handleValidationErrors,
  handleUserById
);
router.get(
  "/getUser/ByName",
  validateUserSearchName,
  handleValidationErrors,
  handleUserByName
);
router.get(
  "/getUser/ByAscent",
  validateUserSearchAscent,
  handleValidationErrors,
  handleUserByAscent
);

export { router };
