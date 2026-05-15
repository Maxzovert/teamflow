import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: groupId } = await params;
  const body = await req.json().catch(() => ({}));
  const messageIds = Array.isArray(body.messageIds) ? body.messageIds : [];

  if (messageIds.length === 0) {
    return apiError("messageIds required");
  }

  if (messageIds.length > 50) {
    return apiError("Too many messages");
  }

  await connectDB();

  const group = await DiscussionGroup.findById(groupId);
  if (!group) return apiError("Discussion group not found", 404);

  const userId = new mongoose.Types.ObjectId(user!.id);
  const ids = messageIds
    .filter((id: unknown) => typeof id === "string")
    .map((id: string) => new mongoose.Types.ObjectId(id));

  const now = new Date();

  await Message.updateMany(
    {
      _id: { $in: ids },
      discussionGroup: groupId,
      sender: { $ne: userId },
      "readBy.user": { $ne: userId },
    },
    { $push: { readBy: { user: userId, readAt: now } } }
  );

  return apiSuccess({ ok: true });
}
