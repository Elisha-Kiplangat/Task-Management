import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import 'dotenv/config';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use('*', logger());

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/tasks', taskRoutes);


app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = process.env.PORT || 3001;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: port,
});
