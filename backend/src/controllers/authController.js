const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const retryMiddleware = require('../middleware/retryMiddleware');
const { response } = require('express');

const register = retryMiddleware(async (req, res, next) => {
  try {
    let { email, password, role } = req.body;

    if (!email || !password) {
      res.locals.response = 'Email and password are required';
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.locals.response = 'Invalid email format';
      return res.status(400).json({ message: res.locals.response });
    }

    if (password.length < 6) {
      res.locals.response = 'Password must be at least 6 characters';
      return res.status(400).json({ message: res.locals.response });
    }

    if (!role || role == 'string' || role.trim() === '') {
      role = 'user';
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      res.locals.response = 'User already exists';
      return res.status(400).json({ message: res.locals.response });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.locals.response = "User registered successfully";
    req.headers.authorization = `Bearer ${token}`;
    res.status(201).json({ token });
    next();
  } catch (error) {
    console.error('Error registering user:', error);
    res.locals.response = `message: 'Server error.', error: ${error.message}`;
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

const login = retryMiddleware(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.locals.response = 'Email and password are required';
      return res.status(400).json({ message: res.locals.response });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.locals.response = 'Invalid email or password';
      return res.status(400).json({ message: res.locals.response });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.locals.response = 'Invalid email or password';
      return res.status(400).json({ message: res.locals.response });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.locals.response = 'User logged in successfully';
    req.headers.authorization = `Bearer ${token}`;
    res.status(200).json({ token });
    next();
  } catch (error) {
    console.error('Error logging in user:', error);
    res.locals.response = `message: 'Server error.', error: ${error.message}`;
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

const deleteUser = retryMiddleware(async (req, res, next) => {
  try {
    const userIdToDelete = req.params.id;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin' && currentUserId !== parseInt(userIdToDelete)) {
      res.locals.response = 'You are not authorized to delete this user';
      return res.status(403).json({ message: res.locals.response });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: parseInt(userIdToDelete) },
    });

    if (!userToDelete) {
      res.locals.response = 'User not found';
      return res.status(404).json({ message: res.locals.response });
    }

    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (userToDelete.role === 'admin' && adminCount === 1) {
      res.locals.response = 'Cannot delete the last admin user';
      return res.status(400).json({ message: res.locals.response });
    }

    await prisma.user.delete({
      where: { id: parseInt(userIdToDelete) },
    });

    const responseMessage = 'User and related tasks deleted successfully.';
    res.locals.response = responseMessage; // Add this line
    res.status(200).json({ message: responseMessage });
    next();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.locals.response = `message: 'Server error.', error: ${error.message}`;
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

const deleteMultipleUsers = retryMiddleware(async (req, res, next) => {
  try {
    let userIds = req.body;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
      res.locals.response = 'Only admins can delete multiple users.';
      return res.status(403).json({ message: res.locals.response });
    }

    if (!userIds || !Array.isArray(userIds)) {
      res.locals.response = 'User IDs must be an array.';
      return res.status(400).json({ message: res.locals.response });
    }

    userIds = userIds.map(id => parseInt(id));

    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    // Check for missing users
    const foundUserIds = usersToDelete.map(u => u.id);
    const missingUserId = userIds.find(id => !foundUserIds.includes(id));
    if (missingUserId) {
      res.locals.response = `User with ID ${missingUserId} not found.`;
      return res.status(404).json({ message: res.locals.response });
    }

    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const usersToDeleteWithRole = usersToDelete.filter(user => user.role === 'admin');
    if (adminCount - usersToDeleteWithRole.length < 1) {
      res.locals.response = 'Cannot delete the last admin user'
      return res.status(400).json({ message: res.locals.response });
    }

    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
    res.locals.response = 'Users deleted successfully.';
    res.status(200).json({ message: res.locals.response });
    next();
  } catch (error) {
    console.error('Error deleting multiple users:', error);
    res.locals.response = `message: 'Server error.', error: ${error.message}`;
    res.status(500).json(res.locals.response);
  }
});

module.exports = { register, login, deleteUser, deleteMultipleUsers };
