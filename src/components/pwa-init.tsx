"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { requestNotificationPermission } from "@/lib/browser-notifications";

export function PwaInit() {
  const { status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* optional */
    });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem("tf-notif-prompted") === "1") return;

    const timer = window.setTimeout(async () => {
      localStorage.setItem("tf-notif-prompted", "1");
      await requestNotificationPermission();
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [status]);

  return null;
}
