"use strict";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { sendSuccess } = require("../utils/apiResponse");

router.get("/", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  sendSuccess(res, {
    message: "API is healthy.",
    data: {
      status: "healthy",
      environment: process.env.NODE_ENV,
      uptime: Math.floor(process.uptime()),
      database: states[mongoose.connection.readyState] || "unknown",
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      },
    },
  });
});

module.exports = router;
