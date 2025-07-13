import jwt from 'jsonwebtoken';
import db from '../drizzle/db.js';
import { userTable } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

const authMiddleware = async (c, next) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.select().from(userTable).where(eq(userTable.id, decoded.id)).limit(1);
    
    if (!user.length) {
      return c.json({ error: 'User not found' }, 401);
    }

    c.set('user', user[0]);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

const adminMiddleware = async (c, next) => {
  const user = c.get('user');
  
  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  
  await next();
};

export { authMiddleware, adminMiddleware };
