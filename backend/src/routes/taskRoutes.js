import { Hono } from 'hono';
import taskController from '../controllers/taskController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const taskRoutes = new Hono();

// All routes require authentication
taskRoutes.use('*', authMiddleware);

// Routes accessible to both users and admins
taskRoutes.get('/my-tasks', taskController.getUserTasks.bind(taskController));
taskRoutes.put('/:id/status', taskController.updateTaskStatus.bind(taskController));

// Admin-only routes
taskRoutes.get('/', adminMiddleware, taskController.getAllTasks.bind(taskController));
taskRoutes.get('/:id', adminMiddleware, taskController.getTaskById.bind(taskController));
taskRoutes.post('/', adminMiddleware, taskController.createTask.bind(taskController));
taskRoutes.put('/:id', adminMiddleware, taskController.updateTask.bind(taskController));
taskRoutes.delete('/:id', adminMiddleware, taskController.deleteTask.bind(taskController));

export default taskRoutes;
