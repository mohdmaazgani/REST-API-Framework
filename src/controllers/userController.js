"use strict";

const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  sendSuccess,
  sendNoContent,
  getPaginationMeta,
  parsePagination,
} = require("../utils/apiResponse");

const getAllUsers = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { role, isActive, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (search)
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, {
    message: "Users retrieved.",
    data: { users },
    meta: getPaginationMeta(total, page, limit),
  });
});

const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(AppError.notFound("User not found."));
  sendSuccess(res, { message: "User retrieved.", data: { user } });
});

const updateProfile = catchAsync(async (req, res, next) => {
  const allowed = ["name", "email"];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  if (!Object.keys(updates).length)
    return next(AppError.badRequest("No valid fields provided."));
  if (updates.email) {
    const exists = await User.findOne({
      email: updates.email,
      _id: { $ne: req.user._id },
    });
    if (exists) return next(AppError.conflict("Email already in use."));
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true },
  );
  sendSuccess(res, { message: "Profile updated.", data: { user } });
});

const updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  if (!["user", "moderator", "admin"].includes(role))
    return next(AppError.badRequest("Invalid role."));
  if (req.params.id === req.user._id.toString())
    return next(AppError.forbidden("Cannot change own role."));
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true },
  );
  if (!user) return next(AppError.notFound("User not found."));
  sendSuccess(res, { message: `Role updated to ${role}.`, data: { user } });
});

const deactivateUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user._id.toString())
    return next(AppError.forbidden("Cannot deactivate own account."));
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, refreshTokens: [] },
    { new: true },
  );
  if (!user) return next(AppError.notFound("User not found."));
  sendSuccess(res, { message: "User deactivated.", data: { user } });
});

const activateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true },
  );
  if (!user) return next(AppError.notFound("User not found."));
  sendSuccess(res, { message: "User activated.", data: { user } });
});

const deleteUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user._id.toString())
    return next(AppError.forbidden("Cannot delete own account."));
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(AppError.notFound("User not found."));
  sendNoContent(res);
});

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
};
