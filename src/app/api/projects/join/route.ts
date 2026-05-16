import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { joinProjectSchema } from "@/lib/validations";
import { getMemberUserId } from "@/lib/member-id";
import { normalizeJoinCode } from "@/lib/project-join-code";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/notifications";
import { emitToUser } from "@/lib/socket-server";

export async function POST(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = joinProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const code = normalizeJoinCode(parsed.data.code);
    if (code.length < 4) {
      return apiError("Enter a valid project code");
    }

    await connectDB();

    const project = await Project.findOne({ joinCode: code });
    if (!project) {
      return apiError("No project found with that code", 404);
    }

    const userId = new mongoose.Types.ObjectId(user!.id);
    const alreadyMember = project.members.some(
      (m) => getMemberUserId(m.user) === user!.id
    );
    if (alreadyMember) {
      return apiError("You are already a member of this project", 400);
    }

    project.members.push({
      user: userId,
      role: "member",
      joinedAt: new Date(),
    });
    await project.save();

    const ownerId = getMemberUserId(project.owner);
    const joinTitle = "New member joined";
    const joinMessage = `A member joined ${project.name} using the project join code`;
    await createNotification({
      recipientId: ownerId,
      senderId: user!.id,
      type: "project_invite",
      title: joinTitle,
      message: joinMessage,
      link: `/projects/${project._id}`,
    }).catch(() => {});
    emitToUser(ownerId, "notification:new", {
      type: "project_invite",
      title: joinTitle,
      message: joinMessage,
      link: `/projects/${project._id}`,
    });

    await logActivity({
      projectId: project._id.toString(),
      userId: user!.id,
      action: "joined project via code",
      entityType: "project",
      entityId: project._id.toString(),
    });

    const populated = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar");

    return apiSuccess(populated);
  } catch {
    return apiError("Failed to join project", 500);
  }
}
