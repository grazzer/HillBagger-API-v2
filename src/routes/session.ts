import express from "express";
import {
  HandleLogoutUser,
  HandleDeleteUser,
  HandleUpdateUserInfo,
  HandleForgotPassword,
} from "../controllers/session.js";
import { router as profile } from "./profile.js";

const router = express.Router();

router.post("/logout", HandleLogoutUser);
router.delete("/deleteUser", HandleDeleteUser);
router.put("/updateUser", HandleUpdateUserInfo);
router.post("/forgotPassword", HandleForgotPassword);

router.use("/profile", profile);

export { router };
