"use strict";

const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

const LOG_DIR = process.env.LOG_DIR || "logs";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`,
  ),
);

const transports = [
  new winston.transports.DailyRotateFile({
    filename: path.join(LOG_DIR, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    maxFiles: "30d",
  }),
  new winston.transports.DailyRotateFile({
    filename: path.join(LOG_DIR, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
  }),
];

if (process.env.NODE_ENV !== "test") {
  transports.push(new winston.transports.Console({ format: consoleFormat }));
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: "rest-api-framework" },
  transports,
});

module.exports = logger;
