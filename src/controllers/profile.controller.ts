import { Request, Response } from "express";
import { getProfile, deleteUser } from "../DataBase/profileDb.js";
import { getUserById } from "../DataBase/userDb.js";

export async function HandleGetProfile(req: Request, res: Response) {
  try {
    getProfile(res.locals.userId).then((user) => {
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

export async function HandleDeleteUser(req: Request, res: Response) {
  try {
    const user = await getUserById(res.locals.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    const response = await deleteUser(res.locals.userId);
    if (response) {
      res.status(200).json({
        success: true,
        message: "User successfully deleted",
      });
      return;
    }
  } catch {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// TODO: update function when changeable details are decided
export async function HandleUpdateUserInfo(req: Request, res: Response) {}

// TODO: create forgot password flow once researched
export async function HandleForgotPassword(req: Request, res: Response) {}
