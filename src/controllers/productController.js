"use strict";

const Product = require("../models/Product");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const {
  sendSuccess,
  sendCreated,
  sendNoContent,
  getPaginationMeta,
  parsePagination,
} = require("../utils/apiResponse");

const getAllProducts = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { category, minPrice, maxPrice, inStock, search, sort } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (search) filter.$text = { $search: search };

  const sortMap = {
    price: { price: 1 },
    "-price": { price: -1 },
    name: { name: 1 },
    "-name": { name: -1 },
    createdAt: { createdAt: 1 },
    "-createdAt": { createdAt: -1 },
  };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("createdBy", "name email")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);
  sendSuccess(res, {
    message: "Products retrieved.",
    data: { products },
    meta: getPaginationMeta(total, page, limit),
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate(
    "createdBy",
    "name email",
  );
  if (!product) return next(AppError.notFound("Product not found."));
  sendSuccess(res, { message: "Product retrieved.", data: { product } });
});

const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock, tags } = req.body;
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    tags,
    createdBy: req.user._id,
  });
  await product.populate("createdBy", "name email");
  sendCreated(res, { message: "Product created.", data: { product } });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(AppError.notFound("Product not found."));
  const isOwner = product.createdBy.toString() === req.user._id.toString();
  const isPrivileged = ["admin", "moderator"].includes(req.user.role);
  if (!isOwner && !isPrivileged)
    return next(
      AppError.forbidden("You do not have permission to update this product."),
    );

  const allowed = [
    "name",
    "description",
    "price",
    "category",
    "stock",
    "tags",
    "isActive",
  ];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true },
  ).populate("createdBy", "name email");
  sendSuccess(res, { message: "Product updated.", data: { product: updated } });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(AppError.notFound("Product not found."));
  const isOwner = product.createdBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin")
    return next(AppError.forbidden("Only the owner or admin can delete this."));
  await Product.findByIdAndDelete(req.params.id);
  sendNoContent(res);
});

const getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        totalStock: { $sum: "$stock" },
      },
    },
    { $sort: { count: -1 } },
  ]);
  sendSuccess(res, { message: "Stats retrieved.", data: { stats } });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
};
