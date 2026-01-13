import express from "express";
import { HandleLogoutUser } from "../controllers/session.controller.js";
import { router as profile } from "./profile.route.js";
import { router as friend } from "./friend.route.js";
import { router as ascent } from "./ascent.route.js";

const router = express.Router();

// /session routes

router.post("/logout", HandleLogoutUser);

router.use("/profile", profile);
router.use("/friend", friend);
router.use("/ascent", ascent);

export { router };
