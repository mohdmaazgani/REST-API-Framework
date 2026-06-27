"use strict";

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, authorize } = require("../middleware/auth");
const { publicLimiter } = require("../middleware/rateLimiter");
const {
  createProductValidator,
  updateProductValidator,
  mongoIdValidator,
  paginationValidator,
} = require("../validators");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (public)
 *     tags: [Products]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: inStock, schema: { type: boolean } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: sort, schema: { type: string } }
 *     responses:
 *       200: { description: Product list }
 */
router.get(
  "/",
  publicLimiter,
  paginationValidator,
  productController.getAllProducts,
);
router.get(
  "/stats",
  authenticate,
  authorize("admin", "moderator"),
  productController.getProductStats,
);
router.get(
  "/:id",
  publicLimiter,
  mongoIdValidator("id"),
  productController.getProductById,
);
router.post(
  "/",
  authenticate,
  createProductValidator,
  productController.createProduct,
);
router.patch(
  "/:id",
  authenticate,
  mongoIdValidator("id"),
  updateProductValidator,
  productController.updateProduct,
);
router.delete(
  "/:id",
  authenticate,
  mongoIdValidator("id"),
  productController.deleteProduct,
);

module.exports = router;
