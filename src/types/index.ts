export type UserRole = "admin" | "member" | "viewer";

export type TaskStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type GroupPermission = "admin" | "open";

export type NotificationType =
  | "task_assigned"
  | "task_accepted"
  | "task_rejected"
  | "task_completed"
  | "mention"
  | "message"
  | "project_invite";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
  designation?: string;
}
