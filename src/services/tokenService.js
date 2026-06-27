"use strict";

const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/AppError");

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    jwtid: uuidv4(),
    issuer: "rest-api-framework",
    audience: "rest-api-framework-client",
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    jwtid: uuidv4(),
    issuer: "rest-api-framework",
    audience: "rest-api-framework-client",
  });

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "rest-api-framework",
      audience: "rest-api-framework-client",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw AppError.unauthorized("Session expired. Please log in again.");
    throw AppError.unauthorized("Invalid token. Please log in again.");
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: "rest-api-framework",
      audience: "rest-api-framework-client",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw AppError.unauthorized(
        "Refresh token expired. Please log in again.",
      );
    throw AppError.unauthorized("Invalid refresh token.");
  }
};

const generateTokenPair = (user) => {
  const payload = { id: user._id, email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ id: user._id }),
  };
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
