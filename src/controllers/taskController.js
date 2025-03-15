const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const retryMiddleware = require('../middleware/retryMiddleware');

const createTask = retryMiddleware(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  let fileUrl = null;
  let fileName = null;

  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type' });
    } else {
      fileUrl = req.file.path;
      fileName = req.file.filename;
    }
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        fileUrl,
        fileName,
        userId,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

const getTasks = retryMiddleware(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { title, description, skip, take, sortBy = 'createdAt' } = req.query;

  const skipValue = isNaN(parseInt(skip)) ? 0 : parseInt(skip);
  const takeValue = isNaN(parseInt(take)) ? 10 : parseInt(take);

  const validSortFields = ['title', 'description', 'createdAt', 'updatedAt'];
  if (!validSortFields.includes(sortBy)) {
    return res.status(400).json({ message: `Invalid sort field. Valid options are: ${validSortFields.join(', ')}` });
  }

  try {
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
      return res.status(404).json({ message: 'No tasks found' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

const updateTask = retryMiddleware(async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { title, description },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

const deleteTask = retryMiddleware(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const taskId = parseInt(id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

const updateTaskStatus = retryMiddleware(async (req, res) => {
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

  try {
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
    res.status(500).json({ message: 'Error updating task status' });
  }
});

module.exports = { createTask, getTasks, updateTask, deleteTask, updateTaskStatus };