import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { emitToDiscussion } from "@/lib/socket-server";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: groupId, messageId } = await params;
  const { emoji } = await req.json();

  if (!emoji) return apiError("Emoji is required");

  await connectDB();

  const message = await Message.findById(messageId);
  if (!message) return apiError("Message not found", 404);

  const existingReaction = message.reactions.find((r) => r.emoji === emoji);

  if (existingReaction) {
    const userIndex = existingReaction.users.findIndex(
      (u) => u.toString() === user!.id
    );
    if (userIndex > -1) {
      existingReaction.users.splice(userIndex, 1);
      if (existingReaction.users.length === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
      }
    } else {
      existingReaction.users.push(user!.id as unknown as import("mongoose").Types.ObjectId);
    }
  } else {
    message.reactions.push({
      emoji,
      users: [user!.id as unknown as import("mongoose").Types.ObjectId],
    });
  }

  await message.save();

  const populated = await Message.findById(messageId).populate(
    "sender",
    "name email avatar"
  );

  emitToDiscussion(groupId, "message:reaction", populated);

  return apiSuccess(populated);
}
