"use strict";

const mongoose = require("mongoose");
const logger = require("../utils/logger");

const MONGODB_OPTIONS = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

const connectDB = async () => {
  try {
    const uri =
      process.env.NODE_ENV === "test"
        ? process.env.MONGODB_URI_TEST
        : process.env.MONGODB_URI;

    const conn = await mongoose.connect(uri, MONGODB_OPTIONS);
    logger.info(
      `MongoDB connected: ${conn.connection.host} [DB: ${conn.connection.name}]`,
    );

    mongoose.connection.on("disconnected", () =>
      logger.warn("MongoDB disconnected."),
    );
    mongoose.connection.on("reconnected", () =>
      logger.info("MongoDB reconnected."),
    );
    mongoose.connection.on("error", (err) =>
      logger.error(`MongoDB error: ${err.message}`),
    );
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed.");
  } catch (error) {
    logger.error(`Error closing MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
