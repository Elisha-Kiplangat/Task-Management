import { pgTable, text, varchar, serial, timestamp, integer } from 'drizzle-orm/pg-core';

// Users Table
export const userTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 10 }).notNull().default('user'), // 'admin' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks Table
export const taskTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  status: varchar("status", { length: 20 }).default('pending'), // 'pending', 'in_progress', 'completed'
  assignedTo: integer("assigned_to").references(() => userTable.id),
  createdBy: integer("created_by").references(() => userTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inferred Types
export const UserSelect = userTable.$inferSelect;
export const UserInsert = userTable.$inferInsert;

export const TaskSelect = taskTable.$inferSelect;
export const TaskInsert = taskTable.$inferInsert;
export const TaskUpdate = taskTable.$inferUpdate;