"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/use-api";
import { useNotificationStore } from "@/stores/notification-store";

interface NotificationsResponse {
  notifications: Array<{
    _id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
  }>;
  unreadCount: number;
}

export function NotificationBootstrap() {
  const { status } = useSession();
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const { data } = useNotifications();

  useEffect(() => {
    if (status !== "authenticated") return;
    const res = data as NotificationsResponse | undefined;
    if (!res) return;
    setNotifications(res.notifications, res.unreadCount);
  }, [status, data, setNotifications]);

  return null;
}
