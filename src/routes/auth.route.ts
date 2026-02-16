import express from "express";
// import ValidateRegistration from "../middleware/validateRegistration.js";
// import ValidateLogin from "../middleware/validateLogin.js";

import {
  ValidateRegistration,
  ValidateLogin,
} from "../middleware/validation/authValidationChains.js";
import {
  handleUserLogin,
  handleUserRefresh,
  handleUserRegister,
} from "../controllers/auth.controller.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

router.post(
  "/register",
  ValidateRegistration,
  handleValidationErrors,
  handleUserRegister,
);
router.post("/login", ValidateLogin, handleValidationErrors, handleUserLogin);

router.get("/refresh", handleUserRefresh);

export { router };
