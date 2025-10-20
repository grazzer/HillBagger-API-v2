import express from "express";
import { userById, userByAscent, userByName } from "../services/user.js";
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
  userById
);
router.get(
  "/getUser/ByName",
  validateUserSearchName,
  handleValidationErrors,
  userByName
);
router.get(
  "/getUser/ByAscent",
  validateUserSearchAscent,
  handleValidationErrors,
  userByAscent
);

export { router };
