"use strict";

const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const handleCastError = (err) =>
  AppError.badRequest(`Invalid ${err.path}: ${err.value}`);
const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  return AppError.conflict(
    `Duplicate value for '${field}'. Please use a different value.`,
  );
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return AppError.badRequest("Validation failed", errors);
};
const handleJWTError = () =>
  AppError.unauthorized("Invalid token. Please log in again.");
const handleJWTExpired = () =>
  AppError.unauthorized("Session expired. Please log in again.");

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
      stack: err.stack,
    });
  }

  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  if (error instanceof mongoose.Error.CastError) error = handleCastError(error);
  if (error.code === 11000) error = handleDuplicateFields(error);
  if (error instanceof mongoose.Error.ValidationError)
    error = handleValidationError(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpired();

  if (!error.isOperational) {
    logger.error("Unexpected error:", {
      message: err.message,
      stack: err.stack,
    });
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }

  res
    .status(error.statusCode)
    .json({
      success: false,
      message: error.message,
      errors: error.errors || null,
    });
};

module.exports = globalErrorHandler;
