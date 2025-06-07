const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const retryMiddleware = require('../middleware/retryMiddleware');
const { logTaskRequest } = require('../middleware/loggingMiddleware');

const createTask = retryMiddleware(async (req, res, next) => {
  try {
    const { title, description, startTask, endTask } = req.body;
    const userId = req.user?.userId;

    // if (!userId) {
    //   res.locals.response = 'User not authenticated';
    //   return res.status(401).json({ message: res.locals.response });
    // }

    if (!title || !description || !endTask) {
      res.locals.response = 'Title, description and End Time are required';
      return res.status(400).json({ message: res.locals.response });
    }

    let fileUrl = null;
    let fileName = null;

    // --- Old disk file handling code (commented out) ---
    /*
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
    */
    // --- End old code ---

    // Use Google Drive upload result if available
    if (req.fileUrl && req.fileName) {
      fileUrl = req.fileUrl;
      fileName = req.fileName;
    }

    const startTaskDate = !startTask || startTask === "string" 
      ? new Date() 
      : new Date(startTask); // Use today's date if startTask is null or "string"

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        fileUrl,
        fileName,
        userId,
        startTask: startTaskDate,
        endTask: new Date(endTask),
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

    // if (!userId) {
    //   res.locals.response = 'User not authenticated';
    //   return res.json({ message: res.locals.response });
    // }

    const { title, description, startTask, endTask, skip, take, sortBy = 'createdAt' } = req.query;

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
        startTask: { gte: startTask ? new Date(startTask) : undefined },
        endTask: { lte: endTask ? new Date(endTask) : undefined },
      },
      skip: skipValue,
      take: takeValue,
      orderBy: { [sortBy]: 'desc' },
    });

    if (tasks.length === 0) {
      res.locals.response = 'No tasks found';
      return res.json({ message: res.locals.response });
    }

    // Ensure startTask and endTask are returned in ISO format
    const formattedTasks = tasks.map(task => ({
      ...task,
      startTask: task.startTask?.toISOString(),
      endTask: task.endTask?.toISOString(),
    }));

    res.locals.response = formattedTasks;
    res.json({ message: res.locals.response });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.locals.response = 'Error fetching tasks';
    res.json({ message: res.locals.response });
  }
}, { onRetry: logTaskRequest });

const updateTask = retryMiddleware(async (req, res, next) => {
  try {
    const { title, description, startTask, endTask, startDate, startTime, endDate, endTime } = req.body; // Include all fields
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.locals.response = 'User not authenticated';
      return res.status(401).json({ message: res.locals.response });
    }

    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      res.locals.response = 'Invalid task ID';
      console.log('Invalid task ID:', taskId);
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
      data: {
        title,
        description,
        startTask: startTask ? new Date(startTask) : task.startTask, // Update startTask if provided
        endTask: endTask ? new Date(endTask) : task.endTask,         // Update endTask if provided                         // Update endTime if provided
      },
    });

    req.taskId = taskId; // Set taskId in request object
    res.locals.response = 'Task updated successfully';
    res.json({ message: res.locals.response, task: updatedTask });
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

const updateTaskStatus = retryMiddleware(async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const taskId = parseInt(id, 10);
    req.taskId = taskId;

    if (isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const validStatuses = ['pending', 'on-hold', 'completed'];
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
    res.locals.response = 'Task status updated successfully';
    res.status(200).json({ message: res.locals.response, tasks: updatedTask });
    next();
  } catch (error) {
    console.error('Error updating task status:', error);
    res.locals.response = `message: Error updating task status error: ${error.message}`;
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
}, { onRetry: logTaskRequest });

module.exports = { createTask, getTasks, updateTask, deleteTask, updateTaskStatus };