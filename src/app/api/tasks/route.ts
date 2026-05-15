import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { TaskGroup } from "@/models/TaskGroup";
import { Todo } from "@/models/Todo";
import { taskSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { emitToUser } from "@/lib/socket-server";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const { projectId, taskGroupId, ...taskData } = body;

    if (!projectId || !taskGroupId) {
      return apiError("Project and task group are required");
    }

    await connectDB();

    const taskGroup = await TaskGroup.findById(taskGroupId);
    if (!taskGroup) return apiError("Task group not found", 404);

    if (taskGroup.permission === "admin") {
      const isAdmin = taskGroup.admins.some(
        (a) => a.toString() === user!.id
      );
      if (!isAdmin) return apiError("Only group admins can assign tasks", 403);
    }

    const task = await Task.create({
      project: projectId,
      taskGroup: taskGroupId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      priority: parsed.data.priority,
      createdBy: user!.id,
      assignedTo: parsed.data.assignedTo || undefined,
      mentionedUsers: parsed.data.mentionedUsers || [],
      status: parsed.data.assignedTo ? "pending" : "in_progress",
    });

    const notifyUser = async (recipientId: string, title: string, message: string) => {
      if (recipientId === user!.id) return;
      await createNotification({
        recipientId,
        senderId: user!.id,
        type: "task_assigned",
        title,
        message,
        link: `/projects/${projectId}`,
        metadata: { taskId: task._id.toString() },
      });
      emitToUser(recipientId, "notification:new", {
        type: "task_assigned",
        title,
        message,
        link: `/projects/${projectId}`,
      });
    };

    if (parsed.data.assignedTo) {
      await notifyUser(
        parsed.data.assignedTo,
        "New Task Assigned",
        `You were assigned: ${parsed.data.title}`
      );
    }

    const mentioned = (parsed.data.mentionedUsers || []) as string[];
    for (const userId of mentioned) {
      if (userId === parsed.data.assignedTo) continue;
      await createNotification({
        recipientId: userId,
        senderId: user!.id,
        type: "mention",
        title: "You were mentioned",
        message: `Mentioned in task: ${parsed.data.title}`,
        link: `/projects/${projectId}`,
        metadata: { taskId: task._id.toString() },
      });
      emitToUser(userId, "notification:new", {
        type: "mention",
        title: "You were mentioned",
        message: `Mentioned in task: ${parsed.data.title}`,
        link: `/projects/${projectId}`,
      });
    }

    await logActivity({
      projectId,
      userId: user!.id,
      action: `created task "${parsed.data.title}"`,
      entityType: "task",
      entityId: task._id.toString(),
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar");

    return apiSuccess(populated, 201);
  } catch {
    return apiError("Failed to create task", 500);
  }
}

export async function GET(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const assignedToMe = searchParams.get("assignedToMe");

  await connectDB();

  const filter: Record<string, unknown> = {};

  if (projectId) filter.project = projectId;
  if (assignedToMe === "true") {
    filter.assignedTo = new mongoose.Types.ObjectId(user!.id);
  }

  const tasks = await Task.find(filter)
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar")
    .sort({ createdAt: -1 });

  return apiSuccess(tasks);
}
