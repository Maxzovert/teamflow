import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { TaskGroup } from "@/models/TaskGroup";
import { Task } from "@/models/Task";
import { Message } from "@/models/Message";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; groupId: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: projectId, groupId } = await params;
  await connectDB();

  const project = await Project.findOne({
    _id: projectId,
    "members.user": new mongoose.Types.ObjectId(user!.id),
  });

  if (!project) return apiError("Project not found", 404);

  const member = project.members.find((m) => m.user.toString() === user!.id);
  const canManage =
    project.owner.toString() === user!.id ||
    member?.role === "owner" ||
    member?.role === "admin";

  if (!canManage) {
    return apiError("Only project admins can delete groups", 403);
  }

  const taskGroup = await TaskGroup.findOne({
    _id: groupId,
    project: projectId,
  });

  if (!taskGroup) return apiError("Task group not found", 404);

  // Delete all tasks associated with this task group
  await Task.deleteMany({ taskGroup: groupId });

  // Delete all chat messages associated with this task group
  await Message.deleteMany({ taskGroup: groupId });

  // Finally, delete the task group itself
  await TaskGroup.deleteOne({ _id: groupId });

  return apiSuccess({ deleted: true });
}
