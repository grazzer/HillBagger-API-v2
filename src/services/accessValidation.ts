import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function accessValidation(
  req: Request,
  res: Response,
  next: Function
) {
  const accessToken = req.cookies["accessToken"];
  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "No access token provided" });
  }
  try {
    const key = process.env.SECRET_ACCESS_TOKEN as string;
    const userId = jwt.verify(accessToken, key) as { id: string };
    res.locals.userId = userId.id;
    return next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid access token." });
  }
}
