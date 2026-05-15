"use client";

import { useEffect, useRef, useState } from "react";
import { AtSign, ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMember } from "./chat-assign-task-dialog";

interface ChatComposeMenuProps {
  members: ChatMember[];
  onMention: (member: ChatMember) => void;
  onAssignTask: (member?: ChatMember) => void;
  variant?: "default" | "discord";
  disabled?: boolean;
}

export function ChatComposeMenu({
  members,
  onMention,
  onAssignTask,
  variant = "default",
  disabled,
}: ChatComposeMenuProps) {
  const isDiscord = variant === "discord";
  const ref = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMentionOpen(false);
      }
    };
    if (menuOpen || mentionOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, mentionOpen]);

  const others = members.filter((m) => m._id);

  const ghostClass = isDiscord
    ? "text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[#404249]"
    : "";

  return (
    <div ref={ref} className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={ghostClass}
        disabled={disabled}
        onClick={() => {
          setMentionOpen(false);
          setMenuOpen((o) => !o);
        }}
        aria-label="More actions"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {menuOpen && (
        <div
          className={cn(
            "absolute bottom-full left-0 mb-2 w-52 rounded-xl border shadow-lg py-1 z-50",
            isDiscord
              ? "border-[#26272d] bg-[#2b2d31]"
              : "border-slate-200 bg-white"
          )}
        >
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors",
              isDiscord
                ? "text-[#dbdee1] hover:bg-[#404249]"
                : "text-slate-700 hover:bg-violet-50"
            )}
            onClick={() => {
              setMenuOpen(false);
              setMentionOpen(true);
            }}
          >
            <AtSign className="h-4 w-4 shrink-0 text-violet-500" />
            <span>
              <span className="font-medium block">Mention</span>
              <span
                className={cn(
                  "text-xs",
                  isDiscord ? "text-[#949ba4]" : "text-slate-500"
                )}
              >
                Tag someone in chat
              </span>
            </span>
          </button>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors",
              isDiscord
                ? "text-[#dbdee1] hover:bg-[#404249]"
                : "text-slate-700 hover:bg-violet-50"
            )}
            onClick={() => {
              setMenuOpen(false);
              onAssignTask();
            }}
          >
            <ClipboardList className="h-4 w-4 shrink-0 text-violet-500" />
            <span>
              <span className="font-medium block">Assign task</span>
              <span
                className={cn(
                  "text-xs",
                  isDiscord ? "text-[#949ba4]" : "text-slate-500"
                )}
              >
                Assign & mention in chat
              </span>
            </span>
          </button>
        </div>
      )}

      {mentionOpen && (
        <div
          className={cn(
            "absolute bottom-full left-0 mb-2 w-56 max-h-48 overflow-y-auto rounded-xl border shadow-lg py-1 z-50",
            isDiscord
              ? "border-[#26272d] bg-[#2b2d31]"
              : "border-slate-200 bg-white"
          )}
        >
          <p
            className={cn(
              "px-3 py-1.5 text-xs font-medium",
              isDiscord ? "text-[#949ba4]" : "text-slate-500"
            )}
          >
            Mention a member
          </p>
          {others.length === 0 ? (
            <p
              className={cn(
                "px-3 py-2 text-sm",
                isDiscord ? "text-[#949ba4]" : "text-slate-500"
              )}
            >
              No members in this channel
            </p>
          ) : (
            others.map((m) => (
              <button
                key={m._id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
                  isDiscord
                    ? "text-[#dbdee1] hover:bg-[#404249]"
                    : "text-slate-700 hover:bg-violet-50"
                )}
                onClick={() => {
                  onMention(m);
                  setMentionOpen(false);
                }}
              >
                <AtSign className="h-3.5 w-3.5 text-violet-500" />
                {m.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
