import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { apiSuccess, requireApiAuth } from "@/lib/api-utils";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();

  const userId = new mongoose.Types.ObjectId(user!.id);

  const groups = await DiscussionGroup.find({ members: userId })
    .populate("project", "name color icon")
    .sort({ updatedAt: -1 })
    .lean();

  return apiSuccess(groups);
}
