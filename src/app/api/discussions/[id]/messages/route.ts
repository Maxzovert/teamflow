import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { User } from "@/models/User";
import { messageSchema } from "@/lib/validations";
import { findMentionedMemberIds } from "@/lib/mention-utils";
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

  if (!parsed.data.suppressNotifications) {
    const memberUsers = await User.find({
      _id: { $in: group.members },
    }).select("name");

    const members = memberUsers.map((m) => ({
      _id: m._id.toString(),
      name: m.name,
    }));

    const parsedMentions = findMentionedMemberIds(parsed.data.content, members);
    const explicitMentions = parsed.data.mentionedUserIds || [];
    const recipientIds = [
      ...new Set([...explicitMentions, ...parsedMentions]),
    ].filter((id) => id !== user!.id);

    if (recipientIds.length > 0) {
      const senderName = user!.name || "Someone";
      const link = `/discussions?channel=${groupId}`;
      const preview = parsed.data.content.slice(0, 100);

      const notifs = recipientIds.map((recipientId) => ({
        recipientId,
        senderId: user!.id,
        type: "mention" as const,
        title: `${senderName} mentioned you in #${group.name}`,
        message: preview,
        link,
      }));

      const created = await createNotifications(notifs);
      created.forEach((doc, i) => {
        const n = notifs[i];
        emitToUser(n.recipientId, "notification:new", {
          _id: doc._id.toString(),
          type: "mention",
          title: n.title,
          message: n.message,
          link: n.link,
        });
      });
    }
  }

  return apiSuccess(populated, 201);
}
