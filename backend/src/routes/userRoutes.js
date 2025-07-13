import { Hono } from 'hono';
import userController from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const userRoutes = new Hono();

// All routes require authentication
userRoutes.use('*', authMiddleware);

// Admin-only routes
userRoutes.get('/', adminMiddleware, userController.getAllUsers.bind(userController));
userRoutes.get('/:id', adminMiddleware, userController.getUserById.bind(userController));
userRoutes.post('/', adminMiddleware, userController.createUser.bind(userController));
userRoutes.put('/:id', adminMiddleware, userController.updateUser.bind(userController));
userRoutes.delete('/:id', adminMiddleware, userController.deleteUser.bind(userController));

export default userRoutes;
