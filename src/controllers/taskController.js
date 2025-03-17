const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const retryMiddleware = require('../middleware/retryMiddleware');
const { logTaskRequest } = require('../middleware/loggingMiddleware');

const createTask = retryMiddleware(async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.locals.response = 'User not authenticated';
      return res.status(401).json({ message: res.locals.response });
    }

    if (!title || !description) {
      res.locals.response = 'Title and description are required';
      return res.status(400).json({ message: res.locals.response });
    }

    let fileUrl = null;
    let fileName = null;

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        res.locals.response = 'Invalid file type';
        return res.status(400).json({ message: res.locals.response });
      } else {
        fileUrl = req.file.path;
        fileName = req.file.filename;
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        fileUrl,
        fileName,
        userId,
      },
    });

    req.taskId = newTask.id; // Set taskId in request object
    res.locals.response = 'Task created successfully';
    res.json({ message: res.locals.response });
    next(); // Call next() after setting taskId
  } catch (error) {
    console.error('Error creating task:', error);
    res.locals.response = 'Error creating task';
    res.json({ message: res.locals.response });
  }
}, { onRetry: logTaskRequest });

const getTasks = retryMiddleware(async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.locals.response = 'User not authenticated';
      return res.json({ message: res.locals.response });
    }

    const { title, description, skip, take, sortBy = 'createdAt' } = req.query;

    const skipValue = isNaN(parseInt(skip)) ? 0 : parseInt(skip);
    const takeValue = isNaN(parseInt(take)) ? 10 : parseInt(take);

    const validSortFields = ['title', 'description', 'createdAt', 'updatedAt'];
    if (!validSortFields.includes(sortBy)) {
      res.locals.response = `Invalid sort field. Valid options are: ${validSortFields.join(', ')}`;
      return res.json({ message: res.locals.response });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        title: { contains: title || '' },
        description: { contains: description || '' },
      },
      skip: skipValue,
      take: takeValue,
      orderBy: { [sortBy]: 'desc' },
    });

    if (tasks.length === 0) {
      res.locals.response = 'No tasks found';
      return res.json({ message: res.locals.response });
    }
    res.locals.response = tasks;
    res.json({ message: res.locals.response });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.locals.response = 'Error fetching tasks';
    res.json({ message: res.locals.response });
  }
}, { onRetry: logTaskRequest });

const updateTask = retryMiddleware(async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.locals.response = 'User not authenticated';
      return res.status(401).json({ message: res.locals.response });
    }

    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      res.locals.response = 'Invalid task ID';
      return res.status(400).json({ message: res.locals.response });
    }

    if (!title || !description) {
      res.locals.response = 'Title and description are required';
      return res.status(400).json({ message: res.locals.response });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      res.locals.response = 'Task not found';
      return res.status(404).json({ message: res.locals.response });
    }

    if (task.userId !== userId) {
      res.locals.response = 'Not authorized to update this task';
      return res.json({ message: res.locals.response });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { title, description },
    });
    req.taskId = taskId; // Set taskId in request object
    res.locals.response = 'Task updated successfully';
    res.json({ message: res.locals.response });
    next(); // Call next() after setting taskId
  } catch (error) {
    console.error('Error updating task:', error);
    res.locals.response = `message: Error updating task error: ${error.message}`;
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}, { onRetry: logTaskRequest });

const deleteTask = retryMiddleware(async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.locals.response = 'User not authenticated';
      return res.status(401).json({ message: res.locals.response });
    }

    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      res.locals.response = 'Invalid task ID';
      return res.status(400).json({ message: res.locals.response });
    }
    console.log('Task ID:', taskId);
    req.taskId = taskId;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      res.locals.response = 'Task not found';
      return res.status(404).json({ message: res.locals.response });
    }

    if (task.userId !== userId) {
      res.locals.response = 'Not authorized to delete this task';
      return res.status(403).json({ message: res.locals.response });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
    res.locals.response = 'Task deleted successfully';
    res.status(200).json({ message: res.locals.response });
    next(); // Move next() here
  } catch (error) {
    res.locals.response = `message: Error deleting task error: ${error.message}`;
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}, { onRetry: logTaskRequest });

const updateTaskStatus = retryMiddleware(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Valid options are: ${validStatuses.join(', ')}` });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.locals.response = `message: Error updating task status error: ${error.message}`;
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}, { onRetry: logTaskRequest });

module.exports = { createTask, getTasks, updateTask, deleteTask, updateTaskStatus };