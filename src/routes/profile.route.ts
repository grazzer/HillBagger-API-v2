import express from "express";
import {
  HandleGetProfile,
  HandleDeleteUser,
} from "../controllers/profile.controller.js";

const router = express.Router();

// /session/profile routes

router.get("/", HandleGetProfile);
router.delete("/deleteUser", HandleDeleteUser);

// TODO: not implemented yet
router.put("/updateUser");
router.post("/forgotPassword");

export { router };
