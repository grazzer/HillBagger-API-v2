import express from "express";
import { getProfile } from "../services/profile.js";

const router = express.Router();

router.get("/profile", getProfile);

export { router };
