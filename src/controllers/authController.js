"use strict";

const User = require("../models/User");
const {
  generateTokenPair,
  verifyRefreshToken,
} = require("../services/tokenService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const logger = require("../utils/logger");

const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return next(AppError.conflict("Email already in use."));

  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = generateTokenPair(user);
  user.refreshTokens = [refreshToken];
  await user.save({ validateBeforeSave: false });

  logger.info(`New user registered: ${email}`);
  sendCreated(res, {
    message: "Account created successfully.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    },
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findByEmailForAuth(email);
  if (!user) return next(AppError.unauthorized("Invalid email or password."));
  if (user.isLocked)
    return next(
      AppError.unauthorized(
        "Account locked due to too many failed attempts. Try again later.",
      ),
    );

  const valid = await user.comparePassword(password);
  if (!valid) {
    await user.incrementLoginAttempts();
    return next(AppError.unauthorized("Invalid email or password."));
  }

  await user.resetLoginAttempts();
  const { accessToken, refreshToken } = generateTokenPair(user);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);
  sendSuccess(res, {
    message: "Login successful.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    },
  });
});

const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body;
  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user) return next(AppError.unauthorized("Invalid refresh token."));

  if (!user.refreshTokens || !user.refreshTokens.includes(token)) {
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    logger.warn(`Token reuse detected: ${user.email}`);
    return next(
      AppError.unauthorized("Token reuse detected. All sessions invalidated."),
    );
  }

  const { accessToken, refreshToken: newRefreshToken } =
    generateTokenPair(user);
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, {
    message: "Tokens refreshed.",
    data: { tokens: { accessToken, refreshToken: newRefreshToken } },
  });
});

const logout = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body;
  if (token) {
    const user = await User.findById(req.user._id).select("+refreshTokens");
    if (user) {
      user.refreshTokens = (user.refreshTokens || []).filter(
        (t) => t !== token,
      );
      await user.save({ validateBeforeSave: false });
    }
  }
  sendSuccess(res, { message: "Logged out successfully." });
});

const logoutAll = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { refreshTokens: [] });
  sendSuccess(res, { message: "Logged out from all devices." });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select(
    "+password +refreshTokens",
  );
  if (!(await user.comparePassword(currentPassword)))
    return next(AppError.badRequest("Current password is incorrect."));
  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
  sendSuccess(res, { message: "Password changed. Please log in again." });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  sendSuccess(res, { message: "Profile retrieved.", data: { user } });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  getMe,
};
