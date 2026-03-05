import express from "express";
import { handleGetHills } from "../controllers/getHills.controller.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";
import { ValidateSearchHills } from "../middleware/validation/getHillsValidationChain.js";

const router = express.Router();

router.get(
  "/search",
  ValidateSearchHills,
  handleValidationErrors,
  handleGetHills,
);

// TODO: to implement
router.get("/search/all", handleGetHills); // return all hills with no pagination
router.get("/setPaginationVal", handleGetHills);
router.get(
  // search by gps coordinates
  "/search/byLocation",
  ValidateSearchHills,
  handleValidationErrors,
  handleGetHills,
);

export { router };
