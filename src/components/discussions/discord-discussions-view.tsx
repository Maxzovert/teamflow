"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Hash, Loader2, MessageSquare, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/chat/chat-panel";
import { DiscussionsAddMenu } from "@/components/discussions/discussions-add-menu";
import { ProjectIconPicker } from "@/components/discussions/project-icon-picker";
import { getProjectDisplayIcon } from "@/lib/project-icon";
import { cn } from "@/lib/utils";
import type { DiscussionChannelItem } from "./discussion-channel-sidebar";

export interface DiscordProjectGroup {
  _id: string;
  name: string;
  color: string;
  icon?: string;
  channels: DiscussionChannelItem[];
}

interface DiscordDiscussionsViewProps {
  projects: DiscordProjectGroup[];
  isLoading?: boolean;
  initialProjectId?: string | null;
  initialChannelId?: string | null;
  onChannelChange?: (projectId: string, channelId: string) => void;
  onProjectChange?: (projectId: string | null) => void;
  addMenuMode?: "global" | "project";
  canCreateAdminGroup?: boolean;
  className?: string;
}

export function DiscordDiscussionsView({
  projects,
  isLoading,
  initialProjectId,
  initialChannelId,
  onChannelChange,
  onProjectChange,
  addMenuMode = "global",
  canCreateAdminGroup = false,
  className,
}: DiscordDiscussionsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialChannelId ? initialProjectId ?? null : initialProjectId ?? null
  );
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    initialChannelId ?? null
  );

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const activeChannel = activeChannelId
    ? projects.flatMap((p) => p.channels).find((c) => c._id === activeChannelId)
    : undefined;

  const showChannels = !!selectedProjectId;
  const showChat = !!activeChannelId;

  useEffect(() => {
    if (!activeChannelId) return;
    const project = projects.find((p) =>
      p.channels.some((c) => c._id === activeChannelId)
    );
    if (project) setSelectedProjectId(project._id);
  }, [activeChannelId, projects]);

  useEffect(() => {
    setSelectedProjectId(initialProjectId ?? null);
  }, [initialProjectId]);

  useEffect(() => {
    setActiveChannelId(initialChannelId ?? null);
  }, [initialChannelId]);

  useEffect(() => {
    if (!initialChannelId && activeChannelId) {
      const stillValid = projects.some((p) =>
        p.channels.some((c) => c._id === activeChannelId)
      );
      if (!stillValid) setActiveChannelId(null);
    }
  }, [projects, activeChannelId, initialChannelId]);

  const selectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveChannelId(null);
    onProjectChange?.(projectId);
  };

  const selectChannel = (projectId: string, channelId: string) => {
    setSelectedProjectId(projectId);
    setActiveChannelId(channelId);
    onChannelChange?.(projectId, channelId);
  };

  const backToChannels = () => {
    setActiveChannelId(null);
    if (selectedProjectId) {
      onProjectChange?.(selectedProjectId);
    }
  };

  const backToGroups = () => {
    setSelectedProjectId(null);
    setActiveChannelId(null);
    onProjectChange?.(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white text-center px-6">
        <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-slate-700 font-medium">No discussion channels yet</p>
        <p className="text-sm text-slate-500 mt-1">Create a channel from a project.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 overflow-hidden bg-white",
        className
      )}
    >
      {/* Group icons — always visible */}
      <div className="flex flex-col items-center w-[60px] shrink-0 py-3 gap-1.5 border-r border-slate-200 bg-slate-100/60">
        {projects.map((project) => {
          const isSelected = selectedProjectId === project._id;
          return (
            <div key={project._id} className="relative group">
              <button
                type="button"
                onClick={() => selectProject(project._id)}
                title={project.name}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl text-2xl transition-all",
                  isSelected
                    ? "bg-white shadow-md ring-2 ring-indigo-500/40 scale-105"
                    : "hover:bg-white/80 hover:scale-105 opacity-90 hover:opacity-100"
                )}
                style={
                  isSelected
                    ? { boxShadow: `0 0 0 1px ${project.color || "#6366f1"}33` }
                    : undefined
                }
              >
                {getProjectDisplayIcon(project.icon)}
              </button>
              <ProjectIconPicker
                projectId={project._id}
                projectName={project.name}
                icon={project.icon}
                variant="rail"
              />
            </div>
          );
        })}
      </div>

      {/* Channel list — after group is selected */}
      {showChannels && (
        <aside
          className={cn(
            "flex flex-col min-h-0 border-r border-slate-200 bg-slate-50/80",
            showChat ? "hidden lg:flex lg:w-[240px] shrink-0" : "flex flex-1 lg:flex-none lg:w-[240px]"
          )}
        >
          <div className="shrink-0 flex items-center gap-1 px-2 h-14 border-b border-slate-200 bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 lg:hidden"
              onClick={backToGroups}
              aria-label="Back to groups"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Channels
              </p>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {selectedProject?.name}
              </p>
            </div>
            <DiscussionsAddMenu
              projectId={selectedProjectId}
              mode={addMenuMode}
              canCreateAdminGroup={canCreateAdminGroup}
            />
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-0.5">
              {selectedProject!.channels.length === 0 ? (
                <p className="px-3 py-6 text-xs text-slate-500 text-center">
                  No channels yet
                </p>
              ) : (
                selectedProject!.channels.map((channel) => {
                  const isActive = activeChannelId === channel._id;
                  return (
                    <button
                      key={channel._id}
                      type="button"
                      onClick={() =>
                        selectChannel(selectedProject!._id, channel._id)
                      }
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-white hover:text-slate-900"
                      )}
                    >
                      {channel.permission === "admin" ? (
                        <Shield className="h-4 w-4 shrink-0 opacity-70" />
                      ) : (
                        <Hash className="h-4 w-4 shrink-0 opacity-70" />
                      )}
                      <span className="truncate">{channel.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* Chat — after channel is selected */}
      {showChat && activeChannel && (
        <div className="flex flex-1 flex-col min-w-0 min-h-0 bg-white">
          <div className="shrink-0 flex items-center gap-2 px-3 h-12 border-b border-slate-200 bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 lg:hidden"
              onClick={backToChannels}
              aria-label="Back to channels"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Hash className="h-5 w-5 shrink-0 text-slate-400 hidden lg:block" />
            <span className="text-sm font-semibold text-slate-900 truncate">
              #{activeChannel.name}
            </span>
          </div>
          <ChatPanel
            key={`${selectedProjectId}-${activeChannel._id}`}
            groupId={activeChannel._id}
            groupName={activeChannel.name}
            projectId={selectedProjectId ?? undefined}
            fillHeight
            hideHeader
          />
        </div>
      )}

      {/* Empty state when chat is not open */}
      {!showChat && (
        <div
          className={cn(
            "flex flex-1 flex-col items-center justify-center text-slate-500 bg-slate-50/30 px-6 text-center",
            showChannels && "hidden lg:flex"
          )}
        >
          {!showChannels ? (
            <>
              <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">Select a group</p>
              <p className="text-sm mt-1 text-slate-500">
                Tap a project icon to see its channels
              </p>
            </>
          ) : (
            <>
              <Hash className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">Select a channel</p>
              <p className="text-sm mt-1 text-slate-500">
                Pick a channel to open the conversation
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}



