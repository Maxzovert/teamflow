import type { ChatMessage } from "@/stores/chat-store";

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

/** Normalize API / socket payloads into ChatMessage shape. */
export function normalizeChatMessage(
  raw: Record<string, unknown>,
  fallbackGroupId?: string
): ChatMessage {
  const senderRaw = raw.sender as Record<string, unknown> | undefined;
  const sender = senderRaw
    ? {
        _id: toId(senderRaw._id ?? senderRaw),
        name: String(senderRaw.name ?? "Unknown"),
        email: String(senderRaw.email ?? ""),
        avatar: senderRaw.avatar as string | undefined,
      }
    : {
        _id: "",
        name: "Unknown",
        email: "",
      };

  return {
    _id: toId(raw._id),
    content: String(raw.content ?? ""),
    sender,
    taskGroup: toId(raw.taskGroup) || fallbackGroupId || "",
    attachments: (raw.attachments as ChatMessage["attachments"]) ?? [],
    reactions: (raw.reactions as ChatMessage["reactions"]) ?? [],
    readBy: (raw.readBy as ChatMessage["readBy"]) ?? [],
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : raw.createdAt instanceof Date
          ? raw.createdAt.toISOString()
          : new Date().toISOString(),
  };
}

export function serializeMessageForSocket(
  doc: Record<string, unknown>,
  groupId: string
): Record<string, unknown> {
  const plain =
    typeof (doc as { toJSON?: () => unknown }).toJSON === "function"
      ? ((doc as { toJSON: () => Record<string, unknown> }).toJSON() as Record<
          string,
          unknown
        >)
      : JSON.parse(JSON.stringify(doc));

  const sender = plain.sender as Record<string, unknown> | undefined;
  if (sender) {
    plain.sender = {
      ...sender,
      _id: toId(sender._id ?? sender),
    };
  }

  plain._id = toId(plain._id);
  plain.taskGroup = groupId;
  return plain;
}
