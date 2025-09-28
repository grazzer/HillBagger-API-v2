import express from "express";
import ValidateRegistration from "../middleware/validateRegistration.js";
import ValidateLogin from "../middleware/validateLogin.js";
import { userRefresh } from "../services/userRefresh.js";
import { userRegister } from "../services/userRegistration.js";
import { userLogin } from "../services/userLogin.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

router.post(
  "/register",
  ValidateRegistration,
  handleValidationErrors,
  userRegister
);
router.post("/login", ValidateLogin, handleValidationErrors, userLogin);

router.get("/refresh", userRefresh);

export { router };
