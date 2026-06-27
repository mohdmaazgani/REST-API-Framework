"use strict";

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description too long"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      set: (v) => Math.round(v * 100) / 100,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["electronics", "clothing", "food", "books", "other"],
        message: "Invalid category",
      },
      lowercase: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.pre(/^find/, function (next) {
  if (this.getFilter().isActive === undefined) this.where({ isActive: true });
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
