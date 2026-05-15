import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const task = await Task.findById(id)
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar")
    .populate("mentionedUsers", "name email avatar");

  if (!task) return apiError("Task not found", 404);
  return apiSuccess(task);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  await connectDB();

  const task = await Task.findById(id);
  if (!task) return apiError("Task not found", 404);

  const allowedFields = [
    "title",
    "description",
    "dueDate",
    "priority",
    "status",
  ];
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      (task as unknown as Record<string, unknown>)[field] = body[field];
    }
  }

  if (body.status === "completed") {
    task.completedAt = new Date();
  }

  await task.save();

  const populated = await Task.findById(id)
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar");

  return apiSuccess(populated);
}
