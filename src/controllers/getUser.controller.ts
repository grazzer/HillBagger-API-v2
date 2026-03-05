import { Request, Response } from "express";
import {
  getUserById,
  getUserByName,
  getUserByAscent,
} from "../DataBase/getUserDb.js";
import { logger } from "../logging/Loggers.js";

export async function handleGetUserById(req: Request, res: Response) {
  const userId = req.body.userId;
  try {
    const user = await getUserById(userId);
    if (user.length > 0) {
      res.status(200).json({
        success: true,
        message: "User found",
        data: user,
      });
      return;
    }
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  } catch (error) {
    logger.error("error getting user by Id:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function handleGetUserByName(req: Request, res: Response) {
  const userName = req.body.userName;
  try {
    const user = await getUserByName(userName);
    if (user.length > 0) {
      res.status(200).json({
        success: true,
        message: "User(s) found",
        data: user,
      });
      return;
    }
    res.status(404).json({
      success: false,
      message: "No users found",
    });
  } catch (error) {
    logger.error("error getting user by name:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function handleGetUserByAscent(req: Request, res: Response) {
  const hillId = req.body.hillId;
  try {
    const user = await getUserByAscent(hillId);
    if (user.length > 0) {
      res.status(200).json({
        success: true,
        message: "User(s) found",
        data: user,
      });
      return;
    }
    res.status(404).json({
      success: false,
      message: "No users found",
    });
  } catch (error) {
    logger.error("error getting user by ascent:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
