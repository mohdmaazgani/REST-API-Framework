"use strict";

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  updateProfileValidator,
  mongoIdValidator,
  paginationValidator,
} = require("../validators");

router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users [Admin/Moderator]
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer } }
 *       - { in: query, name: limit, schema: { type: integer } }
 *       - { in: query, name: role, schema: { type: string } }
 *       - { in: query, name: search, schema: { type: string } }
 *     responses:
 *       200: { description: User list }
 */
router.get(
  "/",
  authorize("admin", "moderator"),
  paginationValidator,
  userController.getAllUsers,
);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update own profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Profile updated }
 */
router.patch("/profile", updateProfileValidator, userController.updateProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID [Admin/Moderator]
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User found }
 *       404: { description: Not found }
 */
router.get(
  "/:id",
  authorize("admin", "moderator"),
  mongoIdValidator("id"),
  userController.getUserById,
);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Update user role [Admin]
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Role updated }
 */
router.patch(
  "/:id/role",
  authorize("admin"),
  mongoIdValidator("id"),
  userController.updateUserRole,
);
router.patch(
  "/:id/deactivate",
  authorize("admin"),
  mongoIdValidator("id"),
  userController.deactivateUser,
);
router.patch(
  "/:id/activate",
  authorize("admin"),
  mongoIdValidator("id"),
  userController.activateUser,
);
router.delete(
  "/:id",
  authorize("admin"),
  mongoIdValidator("id"),
  userController.deleteUser,
);

module.exports = router;
