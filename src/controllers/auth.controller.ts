import { Request, Response, CookieOptions } from "express";
import { authorizeUser, registerUser } from "../DataBase/authDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const key = process.env.SECRET_ACCESS_TOKEN as string;
const isProduction = process.env.NODE_ENV === "production";

const refreshTokenCookieOptions: CookieOptions = {
  maxAge: 30 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,
  sameSite: "none",
};

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 10 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,
  sameSite: "none",
};

function generateJWT(id: string, type: string): string {
  if (!key) {
    throw new Error("Secret key is not defined in environment variables");
  }
  if (type === "access") {
    return jwt.sign({ id }, key, {
      expiresIn: "10m",
    });
  }
  return jwt.sign({ id }, key, {
    expiresIn: "30d",
  });
}

// Middleware to validate access token
export async function handleAccessValidation(
  req: Request,
  res: Response,
  next: Function,
) {
  const accessToken = req.cookies.accessToken;
  try {
    // check if token exists
    if (!accessToken) {
      res.status(400).json({
        success: false,
        message: "No access token provided",
      });
      return;
    }

    // verify token
    if (!key) {
      throw new Error("Secret key is not defined in environment variables");
    }
    const userId = jwt.verify(accessToken, key) as { id: string };

    res.locals.userId = userId.id;
    return next();
  } catch (error) {
    console.error("Error validating user:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.message === "jwt expired") {
        res.status(401).json({
          success: false,
          message: "Access token expired, please refresh.",
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Invalid access token.",
    });
  }
}

export async function handleUserRegister(req: Request, res: Response) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await authorizeUser(email);
    // check if email is already in use
    if (existingUser) {
      res.status(403).json({
        success: false,
        message: "An account with this Email already exists.",
      });
      return;
    }
    const newUser = await registerUser(name, email, password);
    const { password: newUserPassword, ...newUserData } = newUser as User;
    // check if new user was created
    if (newUser) {
      res.status(201).json({
        data: newUserData,
        success: true,
        message: "Your account has been successfully created.",
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: "no changes were made",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function handleUserLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const existingUser = await authorizeUser(email);
    // check if user exists
    if (!existingUser) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again",
      });
      return;
    }
    // check password is correct
    const isPasswordValid = await bcrypt.compare(
      `${password}`,
      existingUser.password,
    );
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again",
      });
      return;
    }

    // create tokens and return data
    const accessToken = generateJWT(existingUser.id, "access");
    const refreshToken = generateJWT(existingUser.id, "refresh");
    const { password: UserPassword, ...userData } = existingUser;

    // set cookies and response
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error userLogin:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function handleUserRefresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  try {
    //check if refresh token is provided
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "No refresh token provided",
      });
      return;
    }

    // verify and create token
    if (!key) {
      throw new Error("Secret key is not defined in environment variables");
    }
    const user = jwt.verify(refreshToken, key) as { id: string };
    const userId = user.id;

    const accessToken = generateJWT(userId, "access");

    // set cookies and response
    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
    });
  } catch (error) {
    console.error("Error user refresh:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      if (error.message === "jwt expired") {
        res.status(401).json({
          success: false,
          message: "Refresh token expired, please refresh.",
        });
        return;
      }
      res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}
