import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { emitToDiscussion } from "@/lib/socket-server";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function POST(
  _req: Request,
  {
    params,
  }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: groupId, messageId } = await params;

  await connectDB();

  const message = await Message.findById(messageId);
  if (!message) return apiError("Message not found", 404);

  const alreadyRead = message.readBy.some(
    (r) => r.user.toString() === user!.id
  );

  if (!alreadyRead) {
    message.readBy.push({
      user: user!.id as unknown as import("mongoose").Types.ObjectId,
      readAt: new Date(),
    });
    await message.save();
  }

  emitToDiscussion(groupId, "message:read", {
    messageId,
    userId: user!.id,
    readAt: new Date(),
  });

  return apiSuccess({ read: true });
}
