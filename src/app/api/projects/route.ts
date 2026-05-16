import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { TaskGroup } from "@/models/TaskGroup";
import { projectSchema } from "@/lib/validations";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";
import { generateUniqueJoinCode } from "@/lib/project-join-code";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();

  const projects = await Project.find({
    "members.user": new mongoose.Types.ObjectId(user!.id),
  })
    .select("-joinCode")
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ updatedAt: -1 });

  return apiSuccess(projects);
}

export async function POST(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const joinCode = await generateUniqueJoinCode(Project);

    const project = await Project.create({
      ...parsed.data,
      joinCode,
      owner: user!.id,
      members: [
        {
          user: user!.id,
          role: "owner",
          joinedAt: new Date(),
        },
      ],
    });


    await logActivity({
      projectId: project._id.toString(),
      userId: user!.id,
      action: "created project",
      entityType: "project",
      entityId: project._id.toString(),
    });

    const populated = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return apiSuccess(populated, 201);
  } catch {
    return apiError("Failed to create project", 500);
  }
}
