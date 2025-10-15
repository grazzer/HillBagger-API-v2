import { Request, Response } from "express";
import { getUserById } from "../DataBase/userDb.js";

export function getUser(req: Request, res: Response) {
  try {
    if (!req.query.userId) {
      res.status(422).json({
        success: false,
        message: "User ID is required",
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
