import db from '../drizzle/db.js';
import { taskTable, userTable } from '../drizzle/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import emailService from './emailService.js';

class TaskService {
  async createTask(taskData, createdBy) {
    try {
      const task = await db.insert(taskTable).values({
        ...taskData,
        createdBy,
      }).returning();

      if (taskData.assignedTo) {
        const assignedUser = await db.select().from(userTable).where(eq(userTable.id, taskData.assignedTo)).limit(1);
        if (assignedUser.length > 0) {
          await emailService.sendTaskAssignmentEmail(
            assignedUser[0].email,
            assignedUser[0].name,
            taskData.title,
            taskData.description,
            taskData.deadline
          );
        }
      }

      return task[0];
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }

  async getAllTasks(filters = {}) {
    try {
      let query = db.select({
        id: taskTable.id,
        title: taskTable.title,
        description: taskTable.description,
        deadline: taskTable.deadline,
        status: taskTable.status,
        createdAt: taskTable.createdAt,
        updatedAt: taskTable.updatedAt,
        assignedTo: {
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
        },
      }).from(taskTable).leftJoin(userTable, eq(taskTable.assignedTo, userTable.id));

      if (filters.status) {
        query = query.where(eq(taskTable.status, filters.status));
      }

      if (filters.assignedTo) {
        query = query.where(eq(taskTable.assignedTo, filters.assignedTo));
      }

      const tasks = await query.orderBy(desc(taskTable.createdAt));
      return tasks;
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  async getTaskById(id) {
    try {
      const task = await db.select({
        id: taskTable.id,
        title: taskTable.title,
        description: taskTable.description,
        deadline: taskTable.deadline,
        status: taskTable.status,
        createdAt: taskTable.createdAt,
        updatedAt: taskTable.updatedAt,
        assignedTo: {
          id: userTable.id,
          name: userTable.name,
          email: userTable.email,
        },
      }).from(taskTable).leftJoin(userTable, eq(taskTable.assignedTo, userTable.id)).where(eq(taskTable.id, id)).limit(1);

      if (!task.length) {
        throw new Error('Task not found');
      }

      return task[0];
    } catch (error) {
      throw new Error(`Error fetching task: ${error.message}`);
    }
  }

  async updateTask(id, updateData, updatedBy) {
    try {
      const existingTask = await db.select().from(taskTable).where(eq(taskTable.id, id)).limit(1);
      
      if (!existingTask.length) {
        throw new Error('Task not found');
      }

      const updatedTask = await db.update(taskTable)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(taskTable.id, id))
        .returning();

      if (updateData.status && updateData.status !== existingTask[0].status) {
        const assignedUser = await db.select().from(userTable).where(eq(userTable.id, existingTask[0].assignedTo)).limit(1);
        const updatedByUser = await db.select().from(userTable).where(eq(userTable.id, updatedBy)).limit(1);
        
        if (assignedUser.length > 0) {
          await emailService.sendTaskStatusUpdateEmail(
            assignedUser[0].email,
            assignedUser[0].name,
            existingTask[0].title,
            updateData.status,
            updatedByUser[0]?.name || 'System'
          );
        }
      }

      return updatedTask[0];
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  async deleteTask(id) {
    try {
      const deletedTask = await db.delete(taskTable).where(eq(taskTable.id, id)).returning();
      
      if (!deletedTask.length) {
        throw new Error('Task not found');
      }

      return deletedTask[0];
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  async getUserTasks(userId) {
    try {
      const tasks = await db.select({
        id: taskTable.id,
        title: taskTable.title,
        description: taskTable.description,
        deadline: taskTable.deadline,
        status: taskTable.status,
        createdAt: taskTable.createdAt,
        updatedAt: taskTable.updatedAt,
      }).from(taskTable).where(eq(taskTable.assignedTo, userId)).orderBy(desc(taskTable.createdAt));

      return tasks;
    } catch (error) {
      throw new Error(`Error fetching user tasks: ${error.message}`);
    }
  }

  async updateTaskStatus(id, status, updatedBy) {
    try {
      return await this.updateTask(id, { status }, updatedBy);
    } catch (error) {
      throw new Error(`Error updating task status: ${error.message}`);
    }
  }
}

export default new TaskService();
