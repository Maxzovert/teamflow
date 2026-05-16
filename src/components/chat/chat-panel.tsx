"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, Paperclip, Smile, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMessages,
  useSendMessage,
  useReactToMessage,
  useMarkMessagesRead,
  useUploadFile,
  useDiscussionContext,
} from "@/hooks/use-api";
import { useChatStore } from "@/stores/chat-store";
import { getSocket } from "@/lib/socket-client";
import { normalizeChatMessage } from "@/lib/chat-message";
import { findMentionedMemberIds } from "@/lib/mention-utils";
import { MessageBubble } from "./message-bubble";
import { ChatComposeMenu } from "./chat-compose-menu";
import {
  ChatAssignTaskDialog,
  type ChatMember,
} from "./chat-assign-task-dialog";
import type { ChatMessage } from "@/stores/chat-store";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

interface ChatPanelProps {
  groupId: string;
  groupName?: string;
  projectId?: string;
  fillHeight?: boolean;
  variant?: "default" | "discord";
  hideHeader?: boolean;
}

interface DiscussionContextData {
  projectId: string;
  members: Array<{
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  }>;
  taskGroups: Array<{ _id: string; name: string }>;
}

export function ChatPanel({
  groupId,
  groupName,
  projectId: projectIdProp,
  fillHeight,
  variant = "default",
  hideHeader = false,
}: ChatPanelProps) {
  const isDiscord = variant === "discord";
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDefaultUserId, setAssignDefaultUserId] = useState<string>();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const seededGroupRef = useRef<string | null>(null);

  const { data: messages, isLoading } = useMessages(groupId);
  const { data: contextData } = useDiscussionContext(groupId);
  const sendMessage = useSendMessage(groupId);
  const reactMessage = useReactToMessage(groupId);
  const markReadBulk = useMarkMessagesRead(groupId);
  const markedReadRef = useRef(new Set<string>());
  const uploadFile = useUploadFile();

  const context = contextData as DiscussionContextData | undefined;
  const projectId = projectIdProp || context?.projectId;

  const allMembersForMentions = useMemo(() => {
    return (context?.members || []).map((m) => ({
      _id: toId(m._id ?? m),
      name: m.name || "Member",
    }));
  }, [context?.members]);

  const members: ChatMember[] = useMemo(() => {
    return allMembersForMentions
      .filter((m) => m._id && m._id !== session?.user?.id)
      .map((m) => {
        const full = context?.members?.find((x) => toId(x._id ?? x) === m._id);
        return {
          _id: m._id,
          name: m.name,
          email: full?.email,
          avatar: full?.avatar,
        };
      });
  }, [allMembersForMentions, context?.members, session?.user?.id]);

  const taskGroups = context?.taskGroups || [];

  const displayMessages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const setMessages = useChatStore((s) => s.setMessages);
  const addMessage = useChatStore((s) => s.addMessage);
  const setActiveGroupId = useChatStore((s) => s.setActiveGroupId);
  const clearChat = useChatStore((s) => s.clearChat);
  const updateMessage = useChatStore((s) => s.updateMessage);

  useEffect(() => {
    setActiveGroupId(groupId);
    seededGroupRef.current = null;

    const socket = getSocket();
    const join = () => socket.emit("join:discussion", groupId);

    const onMessage = (raw: Record<string, unknown>) => {
      const msg = normalizeChatMessage(raw, groupId);
      if (msg.taskGroup && msg.taskGroup !== groupId) return;
      addMessage(msg);
    };

    const onConnect = () => join();

    socket.on("message:new", onMessage);
    socket.on("connect", onConnect);
    if (socket.connected) join();

    return () => {
      socket.off("message:new", onMessage);
      socket.off("connect", onConnect);
      socket.emit("leave:discussion", groupId);
      clearChat();
      setActiveGroupId(null);
    };
  }, [groupId, setActiveGroupId, clearChat, addMessage]);

  useEffect(() => {
    if (!messages || !Array.isArray(messages)) return;
    if (seededGroupRef.current === groupId) return;

    setMessages(
      (messages as ChatMessage[]).map((m) =>
        normalizeChatMessage(m as unknown as Record<string, unknown>, groupId)
      )
    );
    seededGroupRef.current = groupId;
  }, [messages, groupId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  useEffect(() => {
    markedReadRef.current.clear();
  }, [groupId]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const unreadIds = displayMessages
      .filter((msg) => {
        if (msg.sender._id === session.user.id) return false;
        const read = msg.readBy?.some(
          (r) =>
            (typeof r.user === "string" ? r.user : String(r.user)) ===
            session.user.id
        );
        return !read && !markedReadRef.current.has(msg._id);
      })
      .map((msg) => msg._id);

    if (unreadIds.length === 0) return;

    const timer = window.setTimeout(() => {
      unreadIds.forEach((id) => markedReadRef.current.add(id));
      markReadBulk.mutate(unreadIds);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [displayMessages.length, groupId, session?.user?.id, markReadBulk]);

  const emitTyping = useCallback(
    (isTyping: boolean) => {
      const socket = getSocket();
      const user = { name: session?.user?.name || "Someone" };
      if (isTyping) {
        socket.emit("typing:start", { groupId, user });
      } else {
        socket.emit("typing:stop", { groupId, user });
      }
    },
    [groupId, session?.user?.name]
  );

  const handleInputChange = (value: string) => {
    setContent(value);
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const postMessage = async (
    text: string,
    options?: { suppressNotifications?: boolean }
  ) => {
    if (!text.trim()) return;
    const trimmed = text.trim();
    const mentionedUserIds = findMentionedMemberIds(
      trimmed,
      allMembersForMentions
    );
    await sendMessage.mutateAsync({
      content: trimmed,
      mentionedUserIds:
        mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      suppressNotifications: options?.suppressNotifications,
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const text = content.trim();
    setContent("");
    emitTyping(false);
    await postMessage(text);
  };

  const handleMention = (member: ChatMember) => {
    setContent((c) => {
      const prefix = c.length > 0 && !c.endsWith(" ") ? `${c} ` : c;
      return `${prefix}@${member.name} `;
    });
  };

  const handleAssignFromMenu = (member?: ChatMember) => {
    setAssignDefaultUserId(member?._id);
    setAssignOpen(true);
  };

  const handleAssigned = async (text: string) => {
    setContent("");
    await postMessage(text, { suppressNotifications: true });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadFile.mutateAsync(file);
    await sendMessage.mutateAsync({
      content: `📎 ${uploaded.name}`,
      attachments: [uploaded],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const updated = await reactMessage.mutateAsync({ messageId, emoji });
    updateMessage(
      normalizeChatMessage(updated as Record<string, unknown>, groupId)
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden",
        isDiscord ? "bg-[#313338] text-[#dbdee1]" : "bg-white",
        fillHeight
          ? "h-full min-h-0"
          : "h-[500px] rounded-2xl border border-slate-200 shadow-sm"
      )}
    >
      {groupName && !hideHeader && (
        <div
          className={cn(
            "shrink-0 flex items-center gap-2 px-4 h-12 border-b shadow-sm",
            isDiscord ? "border-[#26272d] bg-[#313338]" : "border-slate-200 bg-slate-50"
          )}
        >
          <Hash
            className={cn(
              "h-5 w-5 shrink-0",
              isDiscord ? "text-[#80848e]" : "text-slate-400"
            )}
          />
          <h3
            className={cn(
              "font-semibold truncate",
              isDiscord ? "text-[15px] text-[#f2f3f5]" : "text-slate-900"
            )}
          >
            {groupName}
          </h3>
        </div>
      )}

      <ScrollArea className={cn("flex-1 min-h-0", isDiscord ? "px-4 py-3" : "p-4")}>
        {isLoading && displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2
              className={cn(
                "h-6 w-6 animate-spin",
                isDiscord ? "text-[#949ba4]" : "text-slate-500"
              )}
            />
          </div>
        ) : displayMessages.length === 0 ? (
          <p
            className={cn(
              "text-sm text-center py-8",
              isDiscord ? "text-[#949ba4]" : "text-slate-500"
            )}
          >
            No messages yet. Start the conversation!
          </p>
        ) : (
          <div className={cn(isDiscord ? "space-y-5" : "space-y-4")}>
            {displayMessages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender._id === session?.user?.id}
                onReact={(emoji) => handleReaction(msg._id, emoji)}
                quickEmojis={QUICK_EMOJIS}
                variant={variant}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {typingUsers.length > 0 && (
        <p
          className={cn(
            "px-4 text-xs italic shrink-0",
            isDiscord ? "text-[#949ba4]" : "text-slate-500"
          )}
        >
          {typingUsers.join(", ")} typing...
        </p>
      )}

      {showEmojis && (
        <div
          className={cn(
            "flex gap-1 px-4 py-2 border-t shrink-0",
            isDiscord ? "border-[#26272d] bg-[#2b2d31]" : "border-slate-100"
          )}
        >
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="text-lg hover:scale-125 transition-transform"
              onClick={() => {
                setContent((c) => c + e);
                setShowEmojis(false);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSend}
        className={cn(
          "flex gap-2 p-3 shrink-0",
          isDiscord
            ? "bg-[#383a40] mx-4 mb-4 rounded-lg"
            : "p-4 border-t border-slate-200 bg-slate-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={isDiscord ? "text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#404249]" : ""}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <ChatComposeMenu
          members={members}
          variant={variant}
          onMention={handleMention}
          onAssignTask={handleAssignFromMenu}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={isDiscord ? "text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#404249]" : ""}
          onClick={() => setShowEmojis(!showEmojis)}
        >
          <Smile className="h-4 w-4" />
        </Button>

        <Input
          value={content}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            isDiscord ? `Message #${groupName || "channel"}` : "Type a message..."
          }
          className={cn(
            "flex-1 border-0 shadow-none focus-visible:ring-0",
            isDiscord && "bg-transparent text-[#dbdee1] placeholder:text-[#6d6f78]"
          )}
        />
        <Button
          type="submit"
          size="icon"
          className={isDiscord ? "text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#404249]" : ""}
          disabled={sendMessage.isPending || !content.trim()}
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {projectId && (
        <ChatAssignTaskDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          projectId={projectId}
          taskGroups={taskGroups}
          members={members}
          defaultAssigneeId={assignDefaultUserId}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}
