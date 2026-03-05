import express from "express";
import {
  handleGetUserById,
  handleGetUserByAscent,
  handleGetUserByName,
} from "../controllers/getUser.controller.js";
import {
  validateUserId,
  validateUserName,
  validateHillId,
} from "../middleware/validation/getValidationChains.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

// route /getUser

router.get("/ById", validateUserId, handleValidationErrors, handleGetUserById);
router.get(
  "/ByName",
  validateUserName,
  handleValidationErrors,
  handleGetUserByName,
);
router.get(
  "/ByAscent",
  validateHillId,
  handleValidationErrors,
  handleGetUserByAscent,
);

export { router };
