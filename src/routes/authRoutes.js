const express = require('express');
const { register, login, deleteUser, deleteMultipleUsers, executeQuery } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const {
  registrationLimiter,
  loginLimiter,
  adminOperationLimiter,
} = require('../middleware/rateLimitMiddleware');
const retryMiddleware = require('../middleware/retryMiddleware');
const { logUserRequest } = require('../middleware/loggingMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 description: Role of the user (default is 'user')
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', registrationLimiter, logUserRequest, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/login', loginLimiter, logUserRequest, login);

/**
 * @swagger
 * /api/auth/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, adminOperationLimiter, logUserRequest, deleteUser);

/**
 * @swagger
 * /api/auth/:
 *   delete:
 *     summary: Delete multiple users
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *             description: Array of user IDs to delete
 *     responses:
 *       200:
 *         description: Users deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/', authenticate, adminOperationLimiter, logUserRequest, deleteMultipleUsers);

module.exports = router;
