import express from "express";
import {
  handleUserById,
  handleUserByAscent,
  handleUserByName,
} from "../controllers/user.controller.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";
import {
  validateUserSearchID,
  validateUserSearchName,
  validateUserSearchAscent,
} from "../middleware/validationUserSearch.js";

const router = express.Router();

// route /getUser

router.get(
  "/ById",
  validateUserSearchID,
  handleValidationErrors,
  handleUserById
);
router.get(
  "/ByName",
  validateUserSearchName,
  handleValidationErrors,
  handleUserByName
);
router.get(
  "/ByAscent",
  validateUserSearchAscent,
  handleValidationErrors,
  handleUserByAscent
);

export { router };
