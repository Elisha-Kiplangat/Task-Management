import userService from '../services/userService.js';

class UserController {
  async getAllUsers(c) {
    try {
      const users = await userService.getAllUsers();
      return c.json({ users });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async getUserById(c) {
    try {
      const { id } = c.req.param();
      const user = await userService.getUserById(parseInt(id));
      return c.json({ user });
    } catch (error) {
      return c.json({ error: error.message }, 404);
    }
  }

  async createUser(c) {
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

      return c.json({
        message: 'User created successfully',
        user,
      }, 201);
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async updateUser(c) {
    try {
      const { id } = c.req.param();
      const updateData = await c.req.json();

      // Validate role if provided
      if (updateData.role && !['admin', 'user'].includes(updateData.role)) {
        return c.json({ error: 'Role must be either admin or user' }, 400);
      }

      // Validate email format if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return c.json({ error: 'Invalid email format' }, 400);
        }
      }

      // Validate password length if provided
      if (updateData.password && updateData.password.length < 6) {
        return c.json({ error: 'Password must be at least 6 characters long' }, 400);
      }

      const user = await userService.updateUser(parseInt(id), updateData);

      return c.json({
        message: 'User updated successfully',
        user,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async deleteUser(c) {
    try {
      const { id } = c.req.param();
      const currentUser = c.get('user');

      // Prevent admin from deleting themselves
      if (parseInt(id) === currentUser.id) {
        return c.json({ error: 'Cannot delete your own account' }, 400);
      }

      const user = await userService.deleteUser(parseInt(id));

      return c.json({
        message: 'User deleted successfully',
        user,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }
}

export default new UserController();
