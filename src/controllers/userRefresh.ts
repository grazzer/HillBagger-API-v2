import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function handleUserRefresh(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
      res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
      return;
    }
    const key = process.env.SECRET_ACCESS_TOKEN as string;

    const userId = jwt.verify(refreshToken, key) as { id: string };

    const userData = { id: userId.id };

    const accessToken = jwt.sign(userData, key, { expiresIn: "10m" });
    res.cookie("accessToken", accessToken, {
      maxAge: 10 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid refresh token." });
  }
}
