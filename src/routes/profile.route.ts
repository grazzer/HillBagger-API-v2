import express from "express";
import {
  HandleGetProfile,
  HandleDeleteUser,
  HandleUpdateUserInfo,
  HandleForgotPassword,
} from "../controllers/profile.controller.js";

const router = express.Router();

// /session/profile routes

router.get("/", HandleGetProfile);
router.delete("/deleteUser", HandleDeleteUser);

// TODO: not implemented yet
router.put("/updateUser", HandleUpdateUserInfo);
router.post("/forgotPassword", HandleForgotPassword);

export { router };
