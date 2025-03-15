const express = require('express');
const { createTask, getTasks, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const authenticate = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  taskCreationLimiter,
  taskUpdateLimiter,
  taskDeletionLimiter,
} = require('../middleware/rateLimitMiddleware');
const { logTaskRequest } = require('../middleware/loggingMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/task/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Bad request
 */
router.post('/create', authenticate, taskCreationLimiter, upload.single('file'), logTaskRequest, createTask);

/**
 * @swagger
 * /api/task/getTasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/getTasks', authenticate, logTaskRequest, getTasks);

/**
 * @swagger
 * /api/task/updateTask/{id}:
 *   put:
 *     summary: Update a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put('/updateTask/:id', authenticate, taskUpdateLimiter, logTaskRequest, updateTask);

/**
 * @swagger
 * /api/task/deleteTask/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/deleteTask/:id', authenticate, taskDeletionLimiter, logTaskRequest, deleteTask);

module.exports = router;
