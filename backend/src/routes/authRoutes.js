import { Hono } from 'hono';
import authController from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const authRoutes = new Hono();

// Public routes
authRoutes.post('/register', authController.register.bind(authController));
authRoutes.post('/login', authController.login.bind(authController));

// Protected routes
authRoutes.get('/profile', authMiddleware, authController.getProfile.bind(authController));
authRoutes.put('/profile', authMiddleware, authController.updateProfile.bind(authController));

export default authRoutes;
