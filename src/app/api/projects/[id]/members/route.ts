import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { createNotification } from "@/lib/notifications";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  const { email } = await req.json();

  if (!email) return apiError("Email is required");

  await connectDB();

  const project = await Project.findById(id);
  if (!project) return apiError("Project not found", 404);

  const isAdmin = project.members.some(
    (m) =>
      m.user.toString() === user!.id &&
      ["owner", "admin"].includes(m.role)
  );
  if (!isAdmin) return apiError("Forbidden", 403);

  const newMember = await User.findOne({ email });
  if (!newMember) return apiError("User not found", 404);

  const alreadyMember = project.members.some(
    (m) => m.user.toString() === newMember._id.toString()
  );
  if (alreadyMember) return apiError("User is already a member");

  project.members.push({
    user: newMember._id,
    role: "member",
    joinedAt: new Date(),
  });
  await project.save();

  await createNotification({
    recipientId: newMember._id.toString(),
    senderId: user!.id,
    type: "project_invite",
    title: "Project Invitation",
    message: `You've been added to ${project.name}`,
    link: `/projects/${id}`,
  });

  const populated = await Project.findById(id).populate(
    "members.user",
    "name email avatar"
  );

  return apiSuccess(populated);
}
