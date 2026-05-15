"use client";

import { memo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ChatMessage } from "@/stores/chat-store";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn?: boolean;
  onReact?: (emoji: string) => void;
  quickEmojis?: string[];
  variant?: "default" | "discord";
}

function MessageBubbleInner({
  message,
  isOwn,
  onReact,
  quickEmojis = ["👍", "❤️", "😂"],
  variant = "default",
}: MessageBubbleProps) {
  const isDiscord = variant === "discord";
  const [showReact, setShowReact] = useState(false);

  const initials = message.sender.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const readCount = message.readBy?.length || 0;

  if (isDiscord) {
    return (
      <div
        className="flex gap-4 group hover:bg-[#2e3035]/60 -mx-2 px-2 py-0.5 rounded"
        onMouseEnter={() => setShowReact(true)}
        onMouseLeave={() => setShowReact(false)}
      >
        <Avatar className="h-10 w-10 shrink-0 mt-0.5">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className="text-xs bg-[#5865f2] text-white">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-medium text-[15px] text-[#f2f3f5]">{message.sender.name}</span>
            <span className="text-[11px] text-[#949ba4]">
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>
          <p className="text-[15px] text-[#dbdee1] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {message.attachments?.length > 0 && (
            <div className="mt-1 space-y-1">
              {message.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00a8fc] hover:underline"
                >
                  📎 {a.name}
                </a>
              ))}
            </div>
          )}
          {message.reactions?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {message.reactions.map((r) => (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onReact?.(r.emoji)}
                  className="text-xs px-2 py-0.5 rounded-md bg-[#2b2d31] border border-[#1f2023] hover:bg-[#35373c] text-[#dbdee1]"
                >
                  {r.emoji} {r.users.length}
                </button>
              ))}
            </div>
          )}
          {showReact && onReact && (
            <div className="flex gap-0.5 mt-1">
              {quickEmojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => onReact(e)}
                  className="text-sm hover:scale-125 transition-transform px-1"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-2 max-w-[85%] group", isOwn ? "ml-auto flex-row-reverse" : "")}
      onMouseEnter={() => setShowReact(true)}
      onMouseLeave={() => setShowReact(false)}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-slate-500 mb-1 px-1">{message.sender.name}</span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isOwn
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-slate-100 text-slate-900 rounded-bl-md"
          )}
        >
          <p>{message.content}</p>
          {message.attachments?.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block text-xs underline",
                    isOwn ? "text-indigo-100" : "text-indigo-600"
                  )}
                >
                  📎 {a.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={() => onReact?.(r.emoji)}
                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200"
              >
                {r.emoji} {r.users.length}
              </button>
            ))}
          </div>
        )}

        {showReact && onReact && (
          <div className="flex gap-0.5 mt-1">
            {quickEmojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onReact(e)}
                className="text-sm hover:scale-125 transition-transform px-1"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
          {formatRelativeTime(message.createdAt)}
          {isOwn && readCount > 1 && (
            <span title="Read receipts">✓✓ {readCount - 1}</span>
          )}
        </span>
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
