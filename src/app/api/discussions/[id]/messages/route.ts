import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { messageSchema } from "@/lib/validations";
import { createNotifications } from "@/lib/notifications";
import { serializeMessageForSocket } from "@/lib/chat-message";
import { emitToDiscussion, emitToUser } from "@/lib/socket-server";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { id: groupId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  await connectDB();

  const filter: Record<string, unknown> = { discussionGroup: groupId };
  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(filter)
    .populate("sender", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(limit);

  return apiSuccess(messages.reverse());
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id: groupId } = await params;
  const body = await req.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message);
  }

  await connectDB();

  const group = await DiscussionGroup.findById(groupId);
  if (!group) return apiError("Discussion group not found", 404);

  const message = await Message.create({
    discussionGroup: groupId,
    sender: user!.id,
    content: parsed.data.content,
    attachments: parsed.data.attachments || [],
    readBy: [{ user: user!.id, readAt: new Date() }],
  });

  const populated = await Message.findById(message._id).populate(
    "sender",
    "name email avatar"
  );

  const socketPayload = serializeMessageForSocket(
    populated!.toObject() as unknown as Record<string, unknown>,
    groupId
  );
  emitToDiscussion(groupId, "message:new", socketPayload);

  const otherMembers = group.members.filter(
    (m) => m.toString() !== user!.id
  );

  if (otherMembers.length > 0) {
    const notifs = otherMembers.map((memberId) => ({
      recipientId: memberId.toString(),
      senderId: user!.id,
      type: "message" as const,
      title: `New message in ${group.name}`,
      message: parsed.data.content.slice(0, 100),
      link: `/projects/${group.project}?chat=${groupId}`,
    }));
    await createNotifications(notifs);
    for (const n of notifs) {
      emitToUser(n.recipientId, "notification:new", {
        type: "message",
        title: n.title,
        message: n.message,
        link: n.link,
      });
    }
  }

  return apiSuccess(populated, 201);
}
