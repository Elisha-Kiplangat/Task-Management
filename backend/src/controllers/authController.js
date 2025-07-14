import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';

class AuthController {
  async register(c) {
    try {
      const { name, email, password, role = 'user' } = await c.req.json();

      // Validate input
      if (!name || !email || !password) {
        return c.json({ error: 'Name, email, and password are required' }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return c.json({ error: 'Invalid email format' }, 400);
      }

      // Validate password length
      if (password.length < 6) {
        return c.json({ error: 'Password must be at least 6 characters long' }, 400);
      }

      // Validate role
      if (!['admin', 'user'].includes(role)) {
        return c.json({ error: 'Role must be either admin or user' }, 400);
      }

      const user = await userService.createUser({ name, email, password, role });

      // JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return c.json({
        message: 'User registered successfully',
        user,
        token,
      }, 201);
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async login(c) {
    try {
      const { email, password } = await c.req.json();

      // Validate input
      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const user = await userService.getUserByEmail(email);
      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Validate password
      const isPasswordValid = await userService.validatePassword(password, user.password);
      if (!isPasswordValid) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return c.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async getProfile(c) {
    try {
      const user = c.get('user');
      return c.json({ user });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async updateProfile(c) {
    try {
      const user = c.get('user');
      const updateData = await c.req.json();

      // Users can only update their own profile
      const updatedUser = await userService.updateUser(user.id, updateData);

      return c.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }
}

export default new AuthController();
