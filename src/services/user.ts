import { Request, Response } from "express";
import { getUserById } from "../DataBase/userDb.js";
import { error } from "console";

// get user from input not token

export function getUser(req: Request, res: Response) {
  try {
    if (!req.query.userId) {
      res.status(200).json({
        success: false,
        error: "User ID is required",
      });
      return;
    }
    getUserById(req.query.userId).then((user) => {
      if (user) {
        const { email, ...userData } = user;
        return res.status(200).json({
          success: true,
          message: "User found",
          data: userData,
        });
      } else {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
