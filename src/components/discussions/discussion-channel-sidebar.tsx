"use client";

import { Hash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DiscussionChannelItem {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  permission?: "open" | "admin";
}

interface DiscussionChannelSidebarProps {
  channels: DiscussionChannelItem[];
  activeChannelId: string | null;
  onSelect: (channelId: string) => void;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  renderChannel?: (
    channel: DiscussionChannelItem,
    isActive: boolean,
    children: React.ReactNode
  ) => React.ReactNode;
}

export function DiscussionChannelSidebar({
  channels,
  activeChannelId,
  onSelect,
  title = "Channels",
  subtitle,
  emptyMessage = "No channels available.",
  headerAction,
  renderChannel,
}: DiscussionChannelSidebarProps) {
  return (
    <aside className="flex flex-col h-full min-h-0 border-r border-slate-200 bg-slate-50/50 w-full lg:w-[280px] shrink-0">
      <div className="shrink-0 px-3 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">
              {channels.length} channel{channels.length !== 1 ? "s" : ""}
            </p>
          </div>
          {headerAction}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-0.5">
          {channels.length === 0 ? (
            <p className="text-sm text-slate-500 p-4 text-center">{emptyMessage}</p>
          ) : (
            channels.map((channel) => {
              const isActive = activeChannelId === channel._id;
              const item = (
                <button
                  type="button"
                  onClick={() => onSelect(channel._id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                      : "text-slate-600 hover:bg-white hover:border-slate-200 border border-transparent"
                  )}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Hash
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isActive ? "text-indigo-500" : "text-slate-400"
                      )}
                    />
                    <span className="truncate">{channel.name}</span>
                  </span>
                  {channel.description && (
                    <p className="text-xs text-slate-400 mt-0.5 pl-5 line-clamp-2">
                      {channel.description}
                    </p>
                  )}
                </button>
              );

              if (renderChannel) {
                return (
                  <div key={channel._id}>
                    {renderChannel(channel, isActive, item)}
                  </div>
                );
              }

              return <div key={channel._id}>{item}</div>;
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
