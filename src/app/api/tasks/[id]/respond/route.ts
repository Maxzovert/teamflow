import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { Todo } from "@/models/Todo";
import { taskResponseSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { emitToUser } from "@/lib/socket-server";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = taskResponseSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message);
  }

  await connectDB();

  const task = await Task.findById(id);
  if (!task) return apiError("Task not found", 404);

  if (task.assignedTo?.toString() !== user!.id) {
    return apiError("Only the assigned user can respond", 403);
  }

  if (task.status !== "pending") {
    return apiError("Task has already been responded to");
  }

  const { action, notes, reason } = parsed.data;

  if (action === "accept") {
    task.status = "accepted";
    task.acceptanceNotes = notes;

    await Todo.create({
      user: user!.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority:
        task.priority === "urgent"
          ? "high"
          : (task.priority as "low" | "medium" | "high"),
      sourceTask: task._id,
      isImported: true,
    });

    await createNotification({
      recipientId: task.createdBy.toString(),
      senderId: user!.id,
      type: "task_accepted",
      title: "Task Accepted",
      message: `${user!.name} accepted "${task.title}"`,
      link: `/projects/${task.project}`,
    });

    emitToUser(task.createdBy.toString(), "notification:new", {
      type: "task_accepted",
      title: "Task Accepted",
      message: `${user!.name} accepted "${task.title}"`,
      link: `/projects/${task.project}`,
    });
  } else {
    if (!reason) return apiError("Rejection reason is required");
    task.status = "rejected";
    task.rejectionReason = reason;

    await createNotification({
      recipientId: task.createdBy.toString(),
      senderId: user!.id,
      type: "task_rejected",
      title: "Task Rejected",
      message: `${user!.name} rejected "${task.title}"`,
      link: `/projects/${task.project}`,
    });

    emitToUser(task.createdBy.toString(), "notification:new", {
      type: "task_rejected",
      title: "Task Rejected",
      message: `${user!.name} rejected "${task.title}"`,
      link: `/projects/${task.project}`,
    });
  }

  await task.save();

  const populated = await Task.findById(id)
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar");

  return apiSuccess(populated);
}
