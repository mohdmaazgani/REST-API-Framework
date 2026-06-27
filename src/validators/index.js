"use strict";

const { validationResult, body, param, query } = require("express-validator");
const AppError = require("../utils/AppError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors
      .array()
      .map((e) => ({ field: e.path, message: e.msg, value: e.value }));
    return next(AppError.badRequest("Validation failed", formatted));
  }
  next();
};

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Min 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Must include uppercase, lowercase, number, and special character",
    ),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error("Passwords do not match");
      return true;
    }),
  validate,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

const refreshTokenValidator = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  validate,
];

const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("role").not().exists().withMessage("Role cannot be updated here"),
  body("password").not().exists().withMessage("Use /auth/change-password"),
  validate,
];

const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Min 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Must include uppercase, lowercase, number, and special character",
    )
    .custom((val, { req }) => {
      if (val === req.body.currentPassword)
        throw new Error("New password must differ");
      return true;
    }),
  validate,
];

const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 200 }),
  body("description").optional().trim().isLength({ max: 2000 }),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Must be non-negative"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["electronics", "clothing", "food", "books", "other"])
    .withMessage("Invalid category"),
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Must be non-negative integer"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  validate,
];

const updateProductValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 200 }),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Must be non-negative"),
  body("category")
    .optional()
    .isIn(["electronics", "clothing", "food", "books", "other"])
    .withMessage("Invalid category"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Must be non-negative integer"),
  validate,
];

const mongoIdValidator = (field = "id") => [
  param(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
  validate,
];

const paginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be positive")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be 1-100")
    .toInt(),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  updateProfileValidator,
  changePasswordValidator,
  createProductValidator,
  updateProductValidator,
  mongoIdValidator,
  paginationValidator,
};
