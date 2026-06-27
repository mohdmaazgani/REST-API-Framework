"use strict";

process.env.JWT_SECRET = "test_jwt_secret_minimum_32_chars_long_ok";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_minimum_32_chars__ok";
process.env.JWT_EXPIRES_IN = "1h";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.NODE_ENV = "test";

const {
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../../src/services/tokenService");
const AppError = require("../../src/utils/AppError");
const {
  parsePagination,
  getPaginationMeta,
} = require("../../src/utils/apiResponse");

const mockUser = {
  _id: "64f1a2b3c4d5e6f7a8b9c0d1",
  email: "test@example.com",
  role: "user",
};

describe("TokenService", () => {
  it("should return an access and refresh token", () => {
    const { accessToken, refreshToken } = generateTokenPair(mockUser);
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it("should generate unique tokens on each call", () => {
    const p1 = generateTokenPair(mockUser);
    const p2 = generateTokenPair(mockUser);
    expect(p1.accessToken).not.toBe(p2.accessToken);
  });

  it("should verify a valid access token", () => {
    const { accessToken } = generateTokenPair(mockUser);
    const decoded = verifyAccessToken(accessToken);
    expect(decoded.email).toBe(mockUser.email);
  });

  it("should throw on invalid access token", () => {
    expect(() => verifyAccessToken("bad.token")).toThrow(AppError);
  });

  it("should verify a valid refresh token", () => {
    const { refreshToken } = generateTokenPair(mockUser);
    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.id).toBe(mockUser._id);
  });

  it("should reject access token used as refresh token", () => {
    const { accessToken } = generateTokenPair(mockUser);
    expect(() => verifyRefreshToken(accessToken)).toThrow(AppError);
  });
});

describe("AppError", () => {
  it("should create error with correct statusCode", () => {
    const err = new AppError("Not found", 404);
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it("factory methods should return correct codes", () => {
    expect(AppError.notFound().statusCode).toBe(404);
    expect(AppError.unauthorized().statusCode).toBe(401);
    expect(AppError.forbidden().statusCode).toBe(403);
    expect(AppError.conflict().statusCode).toBe(409);
  });
});

describe("parsePagination", () => {
  it("defaults to page 1 limit 10", () => {
    const { page, limit, skip } = parsePagination({});
    expect(page).toBe(1);
    expect(limit).toBe(10);
    expect(skip).toBe(0);
  });

  it("parses valid query params", () => {
    const { page, limit, skip } = parsePagination({ page: "3", limit: "25" });
    expect(page).toBe(3);
    expect(limit).toBe(25);
    expect(skip).toBe(50);
  });

  it("caps limit at 100", () => {
    expect(parsePagination({ limit: "9999" }).limit).toBe(100);
  });
});
