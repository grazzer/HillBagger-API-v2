import express from "express";
import ValidateRegistration from "../middleware/validateRegistration.js";
import ValidateLogin from "../middleware/validateLogin.js";
import { handleUserRefresh } from "../controllers/userRefresh.js";
import { handleUserRegister } from "../controllers/userRegistration.js";
import { handleUserLogin } from "../controllers/userLogin.js";
import handleValidationErrors from "../middleware/handleValidationErrors.js";

const router = express.Router();

router.post(
  "/register",
  ValidateRegistration,
  handleValidationErrors,
  handleUserRegister
);
router.post("/login", ValidateLogin, handleValidationErrors, handleUserLogin);

router.get("/refresh", handleUserRefresh);

export { router };
