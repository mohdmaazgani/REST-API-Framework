"use strict";

class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

AppError.badRequest = (message = "Bad Request", errors = null) =>
  new AppError(message, 400, errors);
AppError.unauthorized = (message = "Unauthorized.") =>
  new AppError(message, 401);
AppError.forbidden = (message = "Access denied.") => new AppError(message, 403);
AppError.notFound = (message = "Resource not found.") =>
  new AppError(message, 404);
AppError.conflict = (message = "Resource already exists.") =>
  new AppError(message, 409);
AppError.tooManyRequests = (message = "Too many requests.") =>
  new AppError(message, 429);
AppError.internal = (message = "Internal server error.") =>
  new AppError(message, 500);

module.exports = AppError;
