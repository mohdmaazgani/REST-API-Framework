"use strict";

const User = require("../models/User");
const { verifyAccessToken } = require("../services/tokenService");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const authenticate = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer "))
    token = authHeader.split(" ")[1];

  if (!token)
    return next(AppError.unauthorized("No authentication token provided."));

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select("+passwordChangedAt");
  if (!user) return next(AppError.unauthorized("User no longer exists."));
  if (!user.isActive)
    return next(AppError.unauthorized("Account deactivated."));
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      AppError.unauthorized("Password recently changed. Please log in again."),
    );

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        AppError.forbidden(
          `Role '${req.user.role}' is not authorized for this action.`,
        ),
      );
    next();
  };
};

module.exports = { authenticate, authorize };
