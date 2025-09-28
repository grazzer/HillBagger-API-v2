import { Request, Response } from "express";
import { authorizeUser } from "../DataBase/userDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// function generateJWT(id: string): string {
//   const key = process.env.SECRET_ACCESS_TOKEN;
//   if (!key) {
//     throw new Error("Secret key is not defined in environment variables");
//   }
//   return jwt.sign({ id }, key, {
//     expiresIn: "20m",
//   });
// }

export async function userLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    authorizeUser(email).then(async (existingUser) => {
      if (!existingUser) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password. Please try again",
        });
      }
      const isPasswordValid = await bcrypt.compare(
        `${req.body.password}`,
        existingUser.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error:
            "Invalid email or password. Please try again with the correct credentials.",
        });
      }
      const { password, ...user_data } = existingUser;
      const key = process.env.SECRET_ACCESS_TOKEN;
      if (!key) {
        throw new Error("Secret key is not defined in environment variables");
      }

      const userData = { id: existingUser.id };

      const accessToken = jwt.sign(userData, key, { expiresIn: "10m" });
      const refreshToken = jwt.sign(userData, key, { expiresIn: "30d" });
      res.cookie("accessToken", accessToken, {
        maxAge: 10 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.status(200).json({
        success: true,
        data: [user_data],
        message: "Logged in successfully.",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
