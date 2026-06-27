"use strict";

require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/database");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error("Failed to start server:", err);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  server?.close(async () => {
    await disconnectDB();
    logger.info("Shutdown complete.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  gracefulShutdown("unhandledRejection");
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

startServer();
