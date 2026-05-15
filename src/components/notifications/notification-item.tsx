"use client";

import Link from "next/link";
import {
  Bell,
  CheckCircle,
  MessageSquare,
  UserPlus,
  XCircle,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { NotificationType } from "@/types";

interface NotificationSender {
  name: string;
  avatar?: string;
}

export interface NotificationData {
  _id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  sender?: NotificationSender;
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkRead?: (id: string) => void;
}

const typeIcons: Record<string, typeof Bell> = {
  task_assigned: Bell,
  task_accepted: CheckCircle,
  task_rejected: XCircle,
  task_completed: CheckCircle,
  mention: MessageSquare,
  message: MessageSquare,
  project_invite: UserPlus,
};

export function NotificationItem({
  notification,
  onMarkRead,
}: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell;

  const content = (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border transition-colors",
        notification.read
          ? "border-slate-100 bg-slate-50"
          : "border-indigo-100 bg-indigo-50/50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          notification.read ? "bg-slate-50" : "bg-indigo-50"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            notification.read ? "text-slate-500" : "text-indigo-600"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-medium text-sm", notification.read ? "text-slate-500" : "text-slate-900")}>
            {notification.title}
          </p>
          <span className="text-[10px] text-zinc-600 shrink-0">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        {!notification.read && onMarkRead && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(notification._id);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-600 mt-2"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={() => !notification.read && onMarkRead?.(notification._id)}>
        {content}
      </Link>
    );
  }

  return content;
}
