const rateLimit = require('express-rate-limit');

const registrationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  message: 'Too many registration attempts from this IP, please try again after 5 minutes',
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  message: 'Too many login attempts from this IP, please try again after 5 minutes',
});

const taskCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, 
  max: 100, 
  message: 'Too many task creation attempts, please try again after 24 hours',
});

const taskUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: 'Too many task update attempts, please try again after 1 hour',
});

const taskDeletionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: 'Too many task deletion attempts, please try again after 1 hour',
});

const adminOperationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  message: 'Too many admin operations, please try again after 1 minute',
});

module.exports = {
  registrationLimiter,
  loginLimiter,
  taskCreationLimiter,
  taskUpdateLimiter,
  taskDeletionLimiter,
  adminOperationLimiter,
};
