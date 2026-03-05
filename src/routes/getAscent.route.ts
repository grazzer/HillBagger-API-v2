import express from "express";
import {
  handleGetAscent,
  handleGetAscentByID,
} from "../controllers/getAscent.controller.js";
import {
  validateAscentId,
  validateGetAscentGeneral,
} from "../middleware/validation/getValidationChains.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();
// non restricted access to search ascents
// /getAscent routes

router.get(
  "/byId",
  validateAscentId,
  handleValidationErrors,
  handleGetAscentByID,
);

router.get(
  "/search",
  validateGetAscentGeneral,
  handleValidationErrors,
  handleGetAscent,
);

export { router };
