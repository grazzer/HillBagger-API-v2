import { Request, Response } from "express";
import { deleteUser } from "../DataBase/sessionDb.js";

// TODO: create logout flow once researched
export async function HandleLogoutUser(req: Request, res: Response) {}

export async function HandleDeleteUser(req: Request, res: Response) {
  try {
    console.log("Deleting user with ID:", res.locals);
    deleteUser(res.locals.userId).then((success) => {
      if (success) {
        return res.status(200).json({
          success: true,
          message: "User successfully deleted",
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

// TODO: update function when changeable details are decided
export async function HandleUpdateUserInfo(req: Request, res: Response) {}

// TODO: create forgot password flow once researched
export async function HandleForgotPassword(req: Request, res: Response) {}
