const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const retryMiddleware = require('../middleware/retryMiddleware');

const register = retryMiddleware(async (req, res) => {
  let { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  if (!role || role == 'string' || role.trim() === '') {
    role = 'user';
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
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
 req.headers.authorization = `Bearer ${token}`;
  res.status(201).json({ token });
});

const login = retryMiddleware(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({ token });
});

const deleteUser = retryMiddleware(async (req, res) => {
  const userIdToDelete = req.params.id;
  const currentUserId = req.user.userId;
  const currentUserRole = req.user.role;

  if (currentUserRole !== 'admin' && currentUserId !== parseInt(userIdToDelete)) {
    return res.status(403).json({ message: 'You are not authorized to delete this user.' });
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: parseInt(userIdToDelete) },
    });

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (userToDelete.role === 'admin' && adminCount === 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user.' });
    }

    await prisma.user.delete({
      where: { id: parseInt(userIdToDelete) },
    });

    return res.status(200).json({ message: 'User and related tasks deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

const deleteMultipleUsers = retryMiddleware(async (req, res) => {
  let userIds = req.body;
  const currentUserRole = req.user.role;

  if (currentUserRole !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete multiple users.' });
  }

  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ message: 'User IDs must be an array.' });
  }

  userIds = userIds.map(id => parseInt(id));

  try {
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const usersToDeleteWithRole = usersToDelete.filter(user => user.role === 'admin');
    if (adminCount - usersToDeleteWithRole.length < 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    res.status(200).json({ message: 'Users deleted successfully' });
  } catch (error) {
    console.error('Error deleting multiple users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = { register, login, deleteUser, deleteMultipleUsers };
