import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { accessValidation } from "./services/accessValidation.js";
import { router as hills } from "./routes/hills.js";
import { router as userAuth } from "./routes/auth.js";
import { router as profile } from "./routes/profile.js";
import { router as getUser } from "./routes/user.js";

dotenv.config({ path: "./env" });

const app: Express = express();

app.locals.paginationVolume = 20;

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use(hills);
app.use(getUser);

app.use(userAuth); //register, login and refresh routes

app.use(accessValidation); // Protect routes below this line

app.use(profile);

export { app };
