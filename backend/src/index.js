const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const swaggerSetup = require('./swagger');
const {
  registrationLimiter,
  loginLimiter,
  taskCreationLimiter,
  taskUpdateLimiter,
  taskDeletionLimiter,
  adminOperationLimiter
} = require('./middleware/rateLimitMiddleware');
const cors = require('cors');
require('dotenv').config();
require('./middleware/jobMiddleware');

dotenv.config();
app.use(express.json());

// DEBUG: Allow all origins for CORS (for troubleshooting only)
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests for all routes
app.options('*', cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/auth/register', registrationLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/delete', adminOperationLimiter);
app.use('/api/task/create', taskCreationLimiter);
app.use('/api/task/update', taskUpdateLimiter);
app.use('/api/task/delete', taskDeletionLimiter);
app.use('/api/admin', adminOperationLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/task', taskRoutes);

swaggerSetup(app);

app.get('/', (req, res) => {
  res.send('Task Manager API is running');
});
app.get('/test', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});