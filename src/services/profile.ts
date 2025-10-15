import { Request, Response } from "express";
import { getUserById } from "../DataBase/userDb.js";

async function getProfile(req: Request, res: Response) {
  try {
    getUserById(res.locals.userId).then((user) => {
      if (user) {
        const userData = user;
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

export { getProfile };
