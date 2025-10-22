import { Request, Response } from "express";
import {
  getUserById,
  getUserByName,
  getUserByAscent,
} from "../DataBase/userDb.js";

export function handleUserById(req: Request, res: Response) {
  try {
    getUserById(req.body.userId).then((user) => {
      if (user) {
        return res.status(200).json({
          success: true,
          message: "User found",
          data: user,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export function handleUserByName(req: Request, res: Response) {
  try {
    getUserByName(req.body.userName).then((user) => {
      if (user.length > 0) {
        return res.status(200).json({
          success: true,
          message: "User(s) found",
          data: user,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export function handleUserByAscent(req: Request, res: Response) {
  try {
    getUserByAscent(req.body.hillId).then((user) => {
      if (user.length > 0) {
        return res.status(200).json({
          success: true,
          message: "User(s) found",
          data: user,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No users found",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
