import db from '../drizzle/db.js';
import { userTable } from '../drizzle/schema.js';
import { eq, ne } from 'drizzle-orm';
import bcrypt from 'bcrypt';

class UserService {
  async createUser(userData) {
    try {
      const existingUser = await db.select().from(userTable).where(eq(userTable.email, userData.email)).limit(1);
      
      if (existingUser.length > 0) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await db.insert(userTable).values({
        ...userData,
        password: hashedPassword,
      }).returning();

      // Remove password from response
      const { password, ...userWithoutPassword } = user[0];
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      const users = await db.select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        createdAt: userTable.createdAt,
        updatedAt: userTable.updatedAt,
      }).from(userTable);

      return users;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async getUserById(id) {
    try {
      const user = await db.select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        createdAt: userTable.createdAt,
        updatedAt: userTable.updatedAt,
      }).from(userTable).where(eq(userTable.id, id)).limit(1);

      if (!user.length) {
        throw new Error('User not found');
      }

      return user[0];
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async updateUser(id, updateData) {
    try {
      // Check if email is being updated and if it's already taken
      if (updateData.email) {
        const existingUser = await db.select().from(userTable)
          .where(eq(userTable.email, updateData.email))
          .where(ne(userTable.id, id))
          .limit(1);
        
        if (existingUser.length > 0) {
          throw new Error('Email already taken by another user');
        }
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = await db.update(userTable)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, id))
        .returning();

      if (!updatedUser.length) {
        throw new Error('User not found');
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser[0];
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      const deletedUser = await db.delete(userTable).where(eq(userTable.id, id)).returning();
      
      if (!deletedUser.length) {
        throw new Error('User not found');
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = deletedUser[0];
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
      return user.length > 0 ? user[0] : null;
    } catch (error) {
      throw new Error(`Error fetching user by email: ${error.message}`);
    }
  }

  async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new UserService();
