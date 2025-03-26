import express, { Express } from "express";
import cors from "cors";
import { router as hills } from "./routes/hills.js";

const app: Express = express();

app.locals.paginationVolume = 20;

app.use(cors());

app.use(hills);

export { app };
