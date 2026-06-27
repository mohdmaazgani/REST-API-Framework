"use strict";

const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");

const windowMs =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;
const authMaxRequests = parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10;

const makeHandler = (max, mins) => (req, res, next, options) =>
  next(
    AppError.tooManyRequests(
      `Too many requests. Limit: ${max} per ${mins} min.`,
    ),
  );

const globalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler(maxRequests, windowMs / 60000),
  skip: () => process.env.NODE_ENV === "test",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: makeHandler(authMaxRequests, 15),
  skip: () => process.env.NODE_ENV === "test",
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) =>
    next(AppError.tooManyRequests("Rate limit exceeded.")),
  skip: () => process.env.NODE_ENV === "test",
});

module.exports = { globalLimiter, authLimiter, publicLimiter };
