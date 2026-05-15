import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { TaskGroup } from "@/models/TaskGroup";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { Task } from "@/models/Task";
import { projectUpdateSchema } from "@/lib/validations";
import { getMemberUserId } from "@/lib/member-id";
import { ensureProjectJoinCode } from "@/lib/project-join-code";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const project = await Project.findOne({
    _id: id,
    "members.user": new mongoose.Types.ObjectId(user!.id),
  })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (!project) return apiError("Project not found", 404);

  const userId = new mongoose.Types.ObjectId(user!.id);
  const member = project.members.find(
    (m) => getMemberUserId(m.user) === user!.id
  );
  const isOwner = getMemberUserId(project.owner) === user!.id;
  const canManage =
    isOwner || member?.role === "owner" || member?.role === "admin";

  let joinCode: string | undefined;
  if (canManage) {
    joinCode = await ensureProjectJoinCode(project, Project);
  }

  const projectPayload = project.toObject() as unknown as Record<string, unknown>;
  if (canManage && joinCode) {
    projectPayload.joinCode = joinCode;
  } else {
    delete projectPayload.joinCode;
  }

  const [taskGroups, discussionGroups, tasks] = await Promise.all([
    TaskGroup.find({ project: id }),
    DiscussionGroup.find({ project: id, members: userId }).populate(
      "members",
      "name email avatar"
    ),
    Task.find({ project: id })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort({ createdAt: -1 }),
  ]);

  return apiSuccess({
    project: projectPayload,
    taskGroups,
    discussionGroups,
    tasks,
    canManage,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user!.id);
    const project = await Project.findOne({
      _id: id,
      "members.user": userId,
    });

    if (!project) return apiError("Project not found", 404);

    const member = project.members.find(
      (m) => getMemberUserId(m.user) === user!.id
    );
    const isOwner = getMemberUserId(project.owner) === user!.id;
    const canManage =
      isOwner || member?.role === "owner" || member?.role === "admin";

    if (!canManage) {
      return apiError("Only owners and admins can update the project", 403);
    }

    const { name, description, color, icon } = parsed.data;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    if (icon !== undefined) {
      project.icon = icon && icon.trim() ? icon.trim() : undefined;
    }

    await project.save();

    const populated = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return apiSuccess(populated);
  } catch {
    return apiError("Failed to update project", 500);
  }
}
