import express from "express";
import { getUser } from "../services/user.js";

const router = express.Router();

router.get("/getUser", getUser);

export { router };
