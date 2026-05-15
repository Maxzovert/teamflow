import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { discussionGroupSchema } from "@/lib/validations";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

function getMemberRole(
  project: { members: Array<{ user: mongoose.Types.ObjectId; role: string }> },
  userId: string
) {
  const member = project.members.find((m) => m.user.toString() === userId);
  return member?.role;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: projectId } = await params;
  const body = await req.json();
  const parsed = discussionGroupSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message);
  }

  await connectDB();

  const project = await Project.findOne({
    _id: projectId,
    "members.user": new mongoose.Types.ObjectId(user!.id),
  });

  if (!project) return apiError("Project not found", 404);

  const role = getMemberRole(project, user!.id);
  const permission = parsed.data.permission ?? "open";

  if (permission === "admin" && role !== "owner" && role !== "admin") {
    return apiError("Only project admins can create admin-only groups", 403);
  }

  let members: mongoose.Types.ObjectId[];

  if (permission === "admin") {
    const adminUserIds = project.members
      .filter((m) => m.role === "owner" || m.role === "admin")
      .map((m) => m.user);
    const unique = new Set(adminUserIds.map((id) => id.toString()));
    unique.add(user!.id);
    members = [...unique].map((id) => new mongoose.Types.ObjectId(id));
  } else {
    members = parsed.data.memberIds?.length
      ? parsed.data.memberIds.map((id) => new mongoose.Types.ObjectId(id))
      : [new mongoose.Types.ObjectId(user!.id)];
  }

  const group = await DiscussionGroup.create({
    name: parsed.data.name,
    description: parsed.data.description,
    permission,
    project: projectId,
    members,
    createdBy: user!.id,
  });

  const populated = await DiscussionGroup.findById(group._id).populate(
    "members",
    "name email avatar"
  );

  return apiSuccess(populated, 201);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: projectId } = await params;
  await connectDB();

  const userId = new mongoose.Types.ObjectId(user!.id);

  const groups = await DiscussionGroup.find({
    project: projectId,
    members: userId,
  }).populate("members", "name email avatar");

  return apiSuccess(groups);
}
