import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { TaskGroup } from "@/models/TaskGroup";
import { taskGroupSchema } from "@/lib/validations";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: projectId } = await params;
  const body = await req.json();
  const parsed = taskGroupSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message);
  }

  await connectDB();

  const project = await Project.findOne({
    _id: projectId,
    "members.user": new mongoose.Types.ObjectId(user!.id),
  });

  if (!project) return apiError("Project not found", 404);

  const member = project.members.find((m) => m.user.toString() === user!.id);
  const canManage =
    member?.role === "owner" || member?.role === "admin";

  if (parsed.data.permission === "admin" && !canManage) {
    return apiError("Only project admins can create admin-only groups", 403);
  }

  const { icon, ...groupData } = parsed.data;
  const taskGroup = await TaskGroup.create({
    ...groupData,
    ...(icon != null && icon.trim() ? { icon: icon.trim() } : {}),
    project: projectId,
    admins: parsed.data.permission === "admin" ? [user!.id] : [],
  });

  return apiSuccess(taskGroup, 201);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { id: projectId } = await params;
  await connectDB();

  const taskGroups = await TaskGroup.find({ project: projectId });
  return apiSuccess(taskGroups);
}
