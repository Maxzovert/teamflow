"use client";

import { useEffect, useState } from "react";
import { Hash, Loader2, MessageSquare, Shield, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDeleteTaskGroup } from "@/hooks/use-api";
import type { DiscussionChannelItem } from "./discussion-channel-sidebar";

export interface DiscordProjectGroup {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  channels: DiscussionChannelItem[];
}

interface DiscordDiscussionsViewProps {
  project: DiscordProjectGroup;
  isLoading?: boolean;
  initialChannelId?: string | null;
  onChannelChange?: (projectId: string, channelId: string) => void;
  canCreateAdminGroup?: boolean;
  className?: string;
}

export function DiscordDiscussionsView({
  project,
  isLoading,
  initialChannelId,
  onChannelChange,
  canCreateAdminGroup = false,
  className,
}: DiscordDiscussionsViewProps) {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    initialChannelId ?? null
  );

  const activeChannel = activeChannelId
    ? project.channels.find((c) => c._id === activeChannelId)
    : undefined;

  const showChat = !!activeChannelId;

  const deleteGroup = useDeleteTaskGroup(project._id);

  const handleDelete = async (e: React.MouseEvent, channelId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this group? All tasks and messages will be permanently lost.")) {
      await deleteGroup.mutateAsync(channelId);
      if (activeChannelId === channelId) {
        setActiveChannelId(null);
      }
    }
  };

  useEffect(() => {
    setActiveChannelId(initialChannelId ?? null);
  }, [initialChannelId]);

  useEffect(() => {
    if (!initialChannelId && activeChannelId) {
      const stillValid = project.channels.some((c) => c._id === activeChannelId);
      if (!stillValid) setActiveChannelId(null);
    }
  }, [project, activeChannelId, initialChannelId]);

  const selectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    onChannelChange?.(project._id, channelId);
  };

  const backToChannels = () => {
    setActiveChannelId(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (project.channels.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white text-center px-6 border border-slate-200 rounded-xl">
        <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-slate-700 font-medium">No groups yet</p>
        <p className="text-sm text-slate-500 mt-1">Create a group in the Tasks tab.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 overflow-hidden bg-white border border-slate-200 rounded-xl",
        className
      )}
    >
      {/* Channel list */}
      <aside
        className="flex flex-col min-h-0 border-r border-slate-200 bg-slate-50/80 shrink-0 w-[140px] sm:w-[200px] md:w-[240px]"
      >
        <div className="shrink-0 flex items-center gap-1 px-3 h-14 border-b border-slate-200 bg-white">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Groups
            </p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {project.name}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2 space-y-0.5">
            {project.channels.map((channel) => {
              const isActive = activeChannelId === channel._id;
              return (
                <button
                  key={channel._id}
                  type="button"
                  onClick={() => selectChannel(channel._id)}
                  className={cn(
                    "group flex w-full items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  )}
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    {channel.icon ? (
                      <span className="text-base shrink-0">{channel.icon}</span>
                    ) : channel.permission === "admin" ? (
                      <Shield className="h-4 w-4 shrink-0 opacity-70" />
                    ) : (
                      <Hash className="h-4 w-4 shrink-0 opacity-70" />
                    )}
                    <span className="truncate hidden sm:block">{channel.name}</span>
                    <span className="truncate sm:hidden text-xs">{channel.name}</span>
                  </div>
                  {channel.permission === "admin" && (
                    <span className={cn(
                      "text-[9px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 hidden md:block",
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      Admin
                    </span>
                  )}
                  {canCreateAdminGroup && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDelete(e, channel._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200/50 rounded transition-opacity"
                      title="Delete group"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Chat */}
      {showChat && activeChannel ? (
        <div className="flex flex-1 flex-col min-w-0 min-h-0 bg-white">
          <div className="shrink-0 flex items-center gap-2 px-4 h-14 border-b border-slate-200 bg-white">
            {activeChannel.icon ? (
              <span className="text-lg shrink-0 mr-1">{activeChannel.icon}</span>
            ) : (
              <Hash className="h-5 w-5 shrink-0 text-slate-400" />
            )}
            <span className="text-sm font-semibold text-slate-900 truncate">
              {activeChannel.name}
            </span>
            {activeChannel.permission === "admin" && (
              <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-200">
                <Shield className="w-3 h-3 mr-1" />
                Admin Only
              </Badge>
            )}
          </div>
          <ChatPanel
            key={`${project._id}-${activeChannel._id}`}
            groupId={activeChannel._id}
            groupName={activeChannel.name}
            projectId={project._id}
            fillHeight
            hideHeader
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-slate-500 bg-slate-50/30 px-6 text-center">
          <Hash className="h-12 w-12 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">Select a group</p>
          <p className="text-sm mt-1 text-slate-500">
            Pick a group to open the conversation
          </p>
        </div>
      )}
    </div>
  );
}



