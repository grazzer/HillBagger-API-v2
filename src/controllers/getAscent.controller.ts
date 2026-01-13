import { Request, Response } from "express";
import { getAscentByID } from "../DataBase/ascentDb.js";

export async function handleGetAscentByID(req: Request, res: Response) {
  try {
    getAscentByID(req.body.ascentId).then((ascent) => {
      // console.log(ascent);
      if (ascent != null) {
        return res.status(200).json({
          success: true,
          message: "Ascent successfully found",
          data: ascent,
        });
      }
      return res.status(404).json({
        success: false,
        message: "ascent not found",
      });
    });
  } catch (error) {}
}
//TODO:
// what parts of the ascent data should be returned?
// get asscent by location
// get by date?
