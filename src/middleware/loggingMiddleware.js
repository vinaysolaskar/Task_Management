const { PrismaClient } = require('@prisma/client');
const { response } = require('express');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken'); // Add this line to import jwt

const logUserRequest = async (req, res, next) => {
  console.log("User ID in Logging Middleware:", req.user?.userId);
  let userId = req.user?.userId;
  console.log(req.headers.authorization);
  if (!userId && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      console.log("User ID: ", userId);
    } catch (err) {
      console.error('Token verification failed:', err);
    }
  }
  const requestType = req.method;
  responseMessage = res.locals.response;
  console.log("Response Message:", responseMessage);

  res.on('finish', async () => {
    const response = res.statusCode;
    if (userId) {
      await prisma.userLog.create({
        data: {
          userId: userId ? parseInt(userId) : null,
          requestType,
          response: response.toString(),
          responseBody: responseMessage,
        },
      });
    }
  });

  next();
};

const logTaskRequest = async (req, res, next) => {
  console.log("Task ID in Logging Middleware:", req.taskId);
  const taskId = req.taskId || null;
  console.log("taskId", taskId);
  const requestType = req.method;

  res.on('finish', async () => {
    const response = res.statusCode;
    const responseMessage = res.locals.response;
    console.log("Response Message:", responseMessage);
    if (taskId) {
      // Check if the task exists before creating a log entry
      console.log("Task ID in logTaskRequest:", taskId);
      const taskExists = await prisma.task.findUnique({
        where: { id: taskId },
      });
      if (taskExists) {
        await prisma.taskLog.create({
          data: {
            taskId: taskId,
            requestType,
            response: response.toString(),
            responseBody: responseMessage,
          }
        });
      } else {
        console.error(`Task with ID ${taskId} does not exist.`);
      }
    }
  });

  next();
};

module.exports = { logUserRequest, logTaskRequest };
