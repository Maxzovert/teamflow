"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { connectSocket, getSocket } from "@/lib/socket-client";
import { normalizeChatMessage } from "@/lib/chat-message";
import {
  showAppNotification,
  shouldShowSystemNotification,
} from "@/lib/browser-notifications";
import { useNotificationStore } from "@/stores/notification-store";
import { useChatStore } from "@/stores/chat-store";

export function useSocket() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket(userId);

    const onNotification = (data: {
      _id?: string;
      type: string;
      title: string;
      message: string;
      link?: string;
    }) => {
      // Regular chat messages no longer push; only @mentions and other types.
      if (data.type === "message") return;

      const notification = {
        _id: data._id || `live-${Date.now()}`,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        read: false,
        createdAt: new Date().toISOString(),
      };
      useNotificationStore.getState().addNotification(notification);

      if (shouldShowSystemNotification(data.link)) {
        void showAppNotification({
          title: data.title,
          message: data.message,
          link: data.link,
          tag: data._id || data.type,
        });
      }
    };

    const onMessage = (raw: Record<string, unknown>) => {
      const message = normalizeChatMessage(raw);
      const active = useChatStore.getState().activeGroupId;
      const gid = message.taskGroup;
      if (active && gid && gid !== active) return;
      useChatStore.getState().addMessage(message);
    };

    const onReaction = (raw: Record<string, unknown>) => {
      const message = normalizeChatMessage(raw);
      const active = useChatStore.getState().activeGroupId;
      const gid = message.taskGroup;
      if (active && gid && gid !== active) return;
      useChatStore.getState().updateMessage(message);
    };

    const onTypingStart = ({
      groupId,
      user,
    }: {
      groupId?: string;
      user?: { name?: string };
    }) => {
      const active = useChatStore.getState().activeGroupId;
      if (groupId && active && groupId !== active) return;
      if (user?.name) useChatStore.getState().addTypingUser(user.name);
    };

    const onTypingStop = ({
      groupId,
      user,
    }: {
      groupId?: string;
      user?: { name?: string };
    }) => {
      const active = useChatStore.getState().activeGroupId;
      if (groupId && active && groupId !== active) return;
      if (user?.name) useChatStore.getState().removeTypingUser(user.name);
    };

    const onConnect = () => {
      socket.emit("join:user", userId);
      const active = useChatStore.getState().activeGroupId;
      if (active) socket.emit("join:discussion", active);
    };

    socket.on("notification:new", onNotification);
    socket.on("message:new", onMessage);
    socket.on("message:reaction", onReaction);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);
    socket.on("connect", onConnect);

    if (socket.connected) {
      socket.emit("join:user", userId);
    }

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("message:new", onMessage);
      socket.off("message:reaction", onReaction);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      socket.off("connect", onConnect);
    };
  }, [userId]);

  return getSocket();
}
