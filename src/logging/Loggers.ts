import winston from "winston";
import "winston-daily-rotate-file";
const { combine, timestamp, json, printf, prettyPrint, errors } =
  winston.format;

interface SessionLogger extends winston.Logger {
  updateUserId: (userId: string) => void;
}

const loggerFormat = printf(({ level, message, timestamp, UserId }) => {
  if (UserId) {
    return `[${timestamp}] ${level}: (User: ${UserId}) ${message}`;
  }
  return `[${timestamp}] ${level}: ${message}`;
});

const combinedTransport = new winston.transports.DailyRotateFile({
  filename: "combined-%DATE%.log",
  datePattern: "YYYY-w",
  maxFiles: "30d",
  level: "http",
  dirname: "./logs",
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: "error-%DATE%.log",
  datePattern: "YYYY",
  maxFiles: "1y",
  level: "warn",
  dirname: "./logs",
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    winston.format.colorize(),
    loggerFormat,
    // json(),
    // prettyPrint(),
  ),
  transports: [
    new winston.transports.Console(),
    combinedTransport,
    errorTransport,
  ],
});

// account --
// logger for for verification protected routes
export const sessionLogger = logger.child({
  UserId: "Null",
}) as SessionLogger;

// crete method to update user id metadata in session logger after user is verified
sessionLogger.updateUserId = function (userId: string) {
  this.defaultMeta = { UserId: userId };
};
