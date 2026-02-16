import { Request, Response } from "express";
import { getAscentByID } from "../DataBase/ascentDb.js";
import { logger } from "../logging/Loggers.js";

export async function handleGetAscentByID(req: Request, res: Response) {
  try {
    getAscentByID(req.body.ascentId).then((ascent) => {
      // console.log(ascent);
      if (ascent != null) {
        res.status(200).json({
          success: true,
          message: "Ascent successfully found",
          data: ascent,
        });
        return;
      }
      res.status(404).json({
        success: false,
        message: "ascent not found",
      });
    });
  } catch (error) {
    logger.error("Error getting ascent by id", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
//TODO:
// what parts of the ascent data should be returned?
// get asscent by location
// get by date?
