import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().max(8).optional(),
});

export const joinProjectSchema = z.object({
  code: z
    .string()
    .min(4, "Enter a valid project code")
    .max(12, "Code is too long"),
});

export const projectUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().max(8).optional().nullable(),
});

export const taskGroupSchema = z.object({
  name: z.string().min(2, "Group name is required"),
  description: z.string().optional(),
  icon: z.string().max(8).optional().nullable(),
  permission: z.enum(["admin", "open"]).default("open"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  assignedTo: z.string().optional(),
  mentionedUsers: z.array(z.string()).optional(),
});

export const taskResponseSchema = z.object({
  action: z.enum(["accept", "reject"]),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      })
    )
    .optional(),
  /** Users to notify (mention). Omit for normal chat with no @mentions. */
  mentionedUserIds: z.array(z.string()).optional(),
  /** Skip mention alerts (e.g. assign-task already sends task_assigned). */
  suppressNotifications: z.boolean().optional(),
});



export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  avatar: z.string().optional(),
  designation: z.string().max(120, "Designation is too long").optional(),
});
