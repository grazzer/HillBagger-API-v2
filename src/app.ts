import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleAccessValidation } from "./controllers/accessValidation.js";
import { router as hills } from "./routes/hills.route.js";
import { router as userAuth } from "./routes/auth.route.js";
import { router as getUser } from "./routes/user.route.js";
import { router as session } from "./routes/session.route.js";

dotenv.config({ path: "./env" });

const app: Express = express();

app.locals.paginationVolume = 20;

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use("/hills", hills);
app.use("/getUser", getUser);

app.use(userAuth); //register, login and refresh routes

// all routes within session require access validation
app.use("/session", handleAccessValidation, session);

export { app };
