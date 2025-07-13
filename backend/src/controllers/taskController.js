import taskService from '../services/taskService.js';

class TaskController {
  async getAllTasks(c) {
    try {
      const { status, assignedTo } = c.req.query();
      const filters = {};

      if (status) filters.status = status;
      if (assignedTo) filters.assignedTo = parseInt(assignedTo);

      const tasks = await taskService.getAllTasks(filters);
      return c.json({ tasks });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async getTaskById(c) {
    try {
      const { id } = c.req.param();
      const task = await taskService.getTaskById(parseInt(id));
      return c.json({ task });
    } catch (error) {
      return c.json({ error: error.message }, 404);
    }
  }

  async createTask(c) {
    try {
      const { title, description, deadline, assignedTo } = await c.req.json();
      const currentUser = c.get('user');

      // Validate input
      if (!title) {
        return c.json({ error: 'Title is required' }, 400);
      }

      // Validate deadline format if provided
      if (deadline) {
        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime())) {
          return c.json({ error: 'Invalid deadline format' }, 400);
        }
      }

      // Validate assignedTo if provided
      if (assignedTo && isNaN(parseInt(assignedTo))) {
        return c.json({ error: 'Invalid assignedTo user ID' }, 400);
      }

      const taskData = {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
      };

      const task = await taskService.createTask(taskData, currentUser.id);

      return c.json({
        message: 'Task created successfully',
        task,
      }, 201);
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async updateTask(c) {
    try {
      const { id } = c.req.param();
      const updateData = await c.req.json();
      const currentUser = c.get('user');

      // Validate status if provided
      if (updateData.status && !['pending', 'in_progress', 'completed'].includes(updateData.status)) {
        return c.json({ error: 'Status must be one of: pending, in_progress, completed' }, 400);
      }

      // Validate deadline format if provided
      if (updateData.deadline) {
        const deadlineDate = new Date(updateData.deadline);
        if (isNaN(deadlineDate.getTime())) {
          return c.json({ error: 'Invalid deadline format' }, 400);
        }
        updateData.deadline = deadlineDate;
      }

      // Validate assignedTo if provided
      if (updateData.assignedTo && isNaN(parseInt(updateData.assignedTo))) {
        return c.json({ error: 'Invalid assignedTo user ID' }, 400);
      }

      if (updateData.assignedTo) {
        updateData.assignedTo = parseInt(updateData.assignedTo);
      }

      const task = await taskService.updateTask(parseInt(id), updateData, currentUser.id);

      return c.json({
        message: 'Task updated successfully',
        task,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async deleteTask(c) {
    try {
      const { id } = c.req.param();
      const task = await taskService.deleteTask(parseInt(id));

      return c.json({
        message: 'Task deleted successfully',
        task,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async getUserTasks(c) {
    try {
      const currentUser = c.get('user');
      const tasks = await taskService.getUserTasks(currentUser.id);
      return c.json({ tasks });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }

  async updateTaskStatus(c) {
    try {
      const { id } = c.req.param();
      const { status } = await c.req.json();
      const currentUser = c.get('user');

      // Validate status
      if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
        return c.json({ error: 'Status must be one of: pending, in_progress, completed' }, 400);
      }

      // Get task to check if user is assigned to it
      const task = await taskService.getTaskById(parseInt(id));
      
      // Users can only update status of tasks assigned to them, admins can update any task
      if (currentUser.role !== 'admin' && task.assignedTo?.id !== currentUser.id) {
        return c.json({ error: 'You can only update status of tasks assigned to you' }, 403);
      }

      const updatedTask = await taskService.updateTaskStatus(parseInt(id), status, currentUser.id);

      return c.json({
        message: 'Task status updated successfully',
        task: updatedTask,
      });
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }
}

export default new TaskController();
