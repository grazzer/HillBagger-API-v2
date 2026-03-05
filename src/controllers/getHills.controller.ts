import { Request, Response } from "express";
import { HandleSearchHills } from "../services/hills.service.js";
import { logger } from "../logging/Loggers.js";

export async function handleGetHills(req: Request, res: Response) {
  try {
    const results = await HandleSearchHills(
      req.body.classification,
      req.body.search,
      req.body.direction,
      req.body.pagination,
      req.app.locals.paginationVolume,
    );
    if (results) {
      res.status(200).json({
        success: true,
        message: "Hills successfully found",
        data: results,
      });
      return;
    }
    res.status(404).json({
      success: false,
      message: "ascent not found",
    });
  } catch (error) {
    logger.error("Error getting hills", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
