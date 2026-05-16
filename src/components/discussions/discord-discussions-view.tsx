"use client";

import { useEffect, useState } from "react";
import { Hash, Loader2, MessageSquare, Shield, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPanel } from "@/components/chat/chat-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const deleteGroup = useDeleteTaskGroup(project._id);

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    await deleteGroup.mutateAsync(groupToDelete);
    if (activeChannelId === groupToDelete) {
      setActiveChannelId(null);
    }
    setGroupToDelete(null);
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
        className="flex flex-col min-h-0 border-r border-slate-200 bg-slate-50/80 shrink-0 w-[64px] sm:w-[72px]"
      >
        <div className="shrink-0 flex items-center justify-center h-14 border-b border-slate-200 bg-white">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate px-1">
            {project.name.charAt(0)}
          </p>
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
                  title={channel.name}
                  className={cn(
                    "group relative flex w-10 h-10 sm:w-12 sm:h-12 mx-auto items-center justify-center rounded-2xl transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white rounded-xl shadow-md"
                      : "text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:rounded-xl shadow-sm border border-slate-200/60"
                  )}
                >
                  <div className="flex-1 min-w-0 flex items-center justify-center">
                    {channel.icon ? (
                      <span className="text-xl shrink-0 leading-none">{channel.icon}</span>
                    ) : channel.permission === "admin" ? (
                      <Shield className="h-5 w-5 shrink-0 opacity-70" />
                    ) : (
                      <Hash className="h-5 w-5 shrink-0 opacity-70" />
                    )}
                    <span className="hidden">{channel.name}</span>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(channel._id);
                      }}
                      className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 bg-white p-1 rounded-full shadow border border-slate-200 transition-opacity z-10"
                      title="Delete group"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
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
            <span className="text-sm font-semibold text-slate-900 truncate sm:hidden">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete this group? All associated tasks and chat messages will be permanently lost. This action cannot be undone.
            </p>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setGroupToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteGroup.isPending}>
              {deleteGroup.isPending ? "Deleting..." : "Delete Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



