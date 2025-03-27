const { PrismaClient } = require('@prisma/client');
const { response } = require('express');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken'); // Add this line to import jwt

const logUserRequest = async (req, res, next) => {
  let userId = req.user?.userId;
  if (!userId && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      console.error('Token verification failed:', err);
    }
  }
  const requestType = req.method;
  responseMessage = res.locals.response;

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
  const taskId = req.taskId || null;

  res.on('finish', async () => {
    const response = res.statusCode;
    const responseMessage = res.locals.response;
    if (taskId) {
      // Check if the task exists before creating a log entry
        await prisma.taskLog.create({
          data: {
            taskId: taskId,
            requestType,
            response: response.toString(),
            responseBody: responseMessage,
          }
        });
    }
  });

  next();
};

module.exports = { logUserRequest, logTaskRequest };
