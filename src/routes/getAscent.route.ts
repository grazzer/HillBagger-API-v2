import express from "express";
import { handleGetAscentByID } from "../controllers/getAscent.controller.js";

const router = express.Router();
// non restricted access to search ascents
// /getAscent routes

router.get("/byId", handleGetAscentByID);

// /byHillId
// /byUserId

export { router };
