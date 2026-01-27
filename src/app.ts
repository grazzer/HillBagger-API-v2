import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleAccessValidation } from "./controllers/auth.controller.js";
import { router as getHills } from "./routes/getHills.route.js";
import { router as getUser } from "./routes/getUser.route.js";
import { router as getAscent } from "./routes/getAscent.route.js";
import { router as Auth } from "./routes/auth.route.js";
import { router as session } from "./routes/session.route.js";
import { morganLogger } from "./middleware/morgan.js";

dotenv.config({ path: "./env" });

const app: Express = express();

app.locals.paginationVolume = 20;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morganLogger);

app.use("/hills", getHills);
app.use("/getUser", getUser);
app.use("/getAscent", getAscent);

app.use(Auth); //register, login and refresh routes

// all routes within session require jwt to access
app.use("/session", handleAccessValidation, session);

export { app };
