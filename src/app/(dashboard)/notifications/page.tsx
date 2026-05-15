"use client";

import { useEffect } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  NotificationItem,
  type NotificationData,
} from "@/components/notifications/notification-item";
import {
  useNotifications,
  useMarkNotification,
  useMarkAllNotifications,
} from "@/hooks/use-api";
import { useNotificationStore } from "@/stores/notification-store";

interface NotificationsResponse {
  notifications: NotificationData[];
  unreadCount: number;
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotification();
  const markAllRead = useMarkAllNotifications();
  const { setNotifications, markAsRead, markAllRead: markAllInStore } =
    useNotificationStore();

  const response = data as NotificationsResponse | undefined;
  const notifications = response?.notifications || [];

  useEffect(() => {
    if (response) {
      setNotifications(response.notifications, response.unreadCount);
    }
  }, [response, setNotifications]);

  const handleMarkRead = async (id: string) => {
    markAsRead(id);
    await markRead.mutateAsync(id);
  };

  const handleMarkAllRead = async () => {
    markAllInStore();
    await markAllRead.mutateAsync();
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <Header
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "All caught up"}
      />
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        {unread > 0 && (
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Bell className="h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
            <p className="text-sm text-slate-500 mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
