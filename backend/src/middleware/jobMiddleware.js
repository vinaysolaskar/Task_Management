import { CronJob } from 'cron';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Runs every 10 seconds
const job = new CronJob('0 0 * * * 7', () => {
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
                const logTasksToDelete = await prisma.taskLog.create({
                    data: {
                        taskId: task.id,
                        requestType: 'DELETE',
                        response: 'Task deleted during weekly cleanup. Time: ' + new Date().toISOString(),
                        responseBody: JSON.stringify(task)
                    }
                });
            }
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