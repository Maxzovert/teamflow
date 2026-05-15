"use client";

import { useSocket } from "@/hooks/use-socket";
import { PwaInit } from "@/components/pwa-init";
import { NotificationBootstrap } from "@/components/notification-bootstrap";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocket();
  return (
    <>
      <PwaInit />
      <NotificationBootstrap />
      {children}
    </>
  );
}
