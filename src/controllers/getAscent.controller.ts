import { Request, Response } from "express";
import {
  getAscentByID,
  getAscentByHillID,
  getAscentByDate,
  getAscentByDateRange,
  getAscentByHillAndDate,
  getAscentByHillAndDateRange,
} from "../DataBase/getAscentDb.js";
import { logger } from "../logging/Loggers.js";
import { AscentPublic } from "../types/publicGetByTypes.js";

export async function handleGetAscentByID(req: Request, res: Response) {
  const ascentId = req.body.ascentId;
  try {
    const ascent: AscentPublic[] = await getAscentByID(ascentId);
    if (ascent.length > 0) {
      res.status(200).json({
        success: true,
        message: "Ascent successfully found",
        data: ascent,
      });
      return;
    }
    res.status(404).json({
      success: false,
      message: "ascent could not be searched with the provided parameters",
    });
  } catch (error) {
    logger.error("Error getting ascent by id", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function handleGetAscent(req: Request, res: Response) {
  const hillId = req.body.hillId;
  const date = req.body.date;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;

  let ascent: AscentPublic[] | null = null;
  try {
    if (startDate && endDate && date) {
      res.status(422).json({
        success: false,
        message: "Cannot search by date and date range at the same time",
      });
      return;
    }
    // if HillId only
    if (hillId && !date && !startDate && !endDate) {
      ascent = await getAscentByHillID(hillId);
    }
    // if date only
    if (date && !hillId && !startDate && !endDate) {
      ascent = await getAscentByDate(date);
    }
    // if date range only
    if (startDate && endDate && !hillId && !date) {
      ascent = await getAscentByDateRange(startDate, endDate);
    }
    // if hillId and date
    if (hillId && date && !startDate && !endDate) {
      ascent = await getAscentByHillAndDate(hillId, date);
    }
    // if hillId and date range
    if (hillId && startDate && endDate && !date) {
      ascent = await getAscentByHillAndDateRange(hillId, startDate, endDate);
    }
    if (ascent) {
      res.status(200).json({
        success: true,
        message: "Ascent successfully found",
        data: ascent,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "ascent could not be searched with the provided parameters",
    });
  } catch (error) {
    logger.error("Error getting ascent", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
