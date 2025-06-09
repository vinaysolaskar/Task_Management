const { CronJob } = require('cron');
const { PrismaClient } = require('@prisma/client');
const { deleteFileFromDrive } = require('../utils/googleDrive');
const prisma = new PrismaClient();

// Runs every Sunday at midnight
const job = new CronJob('0 0 * * 7', () => {
    console.log('Weekly:: Running weekly cleanup job at', new Date().toISOString());
    (async () => {
        try {
            const findTasksToDelete = await prisma.task.findMany({
                where: {
                    endTask: {
                        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
                    }
                }
            });
            for (const task of findTasksToDelete) {
                // Log the task
                await prisma.taskLog.create({
                    data: {
                        taskId: task.id,
                        requestType: 'DELETE',
                        response: 'Task deleted during weekly cleanup. Time: ' + new Date().toISOString(),
                        responseBody: JSON.stringify(task)
                    }
                });
                // Delete file from Google Drive if fileId exists
                if (task.fileUrl && task.fileUrl.includes('id=')) {
                    const fileId = task.fileUrl.split('id=')[1].split('&')[0];
                    await deleteFileFromDrive(fileId);
                }
            }
            // Delete tasks from DB
            const result = await prisma.task.deleteMany({
                where: {
                    endTask: {
                        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            });
            console.log(`Deleted ${result.count} old tasks`);
        } catch (error) {
            console.error('Weekly:: Error deleting old tasks:', error);
        }
    })();
});

job.start();