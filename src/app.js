import express from "express";
import { router as hills } from "./routes/hills.js";

const app = express();

app.locals.paginationVolume = 20;

app.use(hills);

export { app };
