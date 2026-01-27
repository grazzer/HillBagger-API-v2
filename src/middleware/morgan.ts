import morgan from "morgan";
import { logger } from "../logging/Loggers.js";

export const morganLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  },
);
