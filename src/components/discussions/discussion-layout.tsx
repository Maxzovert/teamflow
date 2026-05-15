"use client";

import { DiscussionChannelSidebar, type DiscussionChannelItem } from "./discussion-channel-sidebar";

interface DiscussionLayoutProps {
  channels: DiscussionChannelItem[];
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  sidebarTitle?: string;
  sidebarSubtitle?: string;
  sidebarAction?: React.ReactNode;
  emptyMessage?: string;
  renderChannel?: DiscussionChannelSidebarProps["renderChannel"];
  children: React.ReactNode;
}

type DiscussionChannelSidebarProps = React.ComponentProps<typeof DiscussionChannelSidebar>;

export function DiscussionLayout({
  channels,
  activeChannelId,
  onSelectChannel,
  sidebarTitle,
  sidebarSubtitle,
  sidebarAction,
  emptyMessage,
  renderChannel,
  children,
}: DiscussionLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[min(640px,calc(100vh-12rem))] min-h-[420px]">
      <DiscussionChannelSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onSelect={onSelectChannel}
        title={sidebarTitle}
        subtitle={sidebarSubtitle}
        headerAction={sidebarAction}
        emptyMessage={emptyMessage}
        renderChannel={renderChannel}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">{children}</div>
    </div>
  );
}
