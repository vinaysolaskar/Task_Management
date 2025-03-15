const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken'); // Add this line to import jwt

const logUserRequest = async (req, res, next) => {
  let userId = req.user?.userId;
  console.log('User:', req.user);
  console.log('auth', req.headers.authorization);
  if (!userId && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      console.log('Decoded:', decoded);
    } catch (err) {
      console.error('Token verification failed:', err);
    }
  }

  const requestType = req.method;
  console.log('Vinay Sr Calling' + userId);
  console.log('Vinay Sr Auth ' + req.headers.authorization);

  console.log('userId:', userId);
  console.log('requestType:', requestType);
  res.on('finish', async () => {
    const response = res.statusCode;
    if (userId) {
      await prisma.userLog.create({
        data: {
            userId: userId ? parseInt(userId) : null,
          requestType,
          response: response.toString(),
        //   user: {
        //     connect: { id: userId }
        //   }
        },
      });
    }
  });

  next();
};

const logTaskRequest = async (req, res, next) => {
  const taskId = req.params.id || null;
  const requestType = req.method;

  res.on('finish', async () => {
    const response = res.statusCode;
    if (taskId) {
      await prisma.taskLog.create({
        data: {
          taskId: taskId ? parseInt(taskId) : null,
          requestType,
          requestId: taskId ? parseInt(taskId) : null,
          response: response.toString(),
          task: {
            connect: { id: taskId }
          }
        }
      });
    }
  });

  next();
};

module.exports = { logUserRequest, logTaskRequest };
