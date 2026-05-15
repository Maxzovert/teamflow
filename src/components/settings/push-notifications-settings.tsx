"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/lib/browser-notifications";

export function PushNotificationsSettings() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported" | "loading"
  >("loading");

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const enable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const enabled = permission === "granted";
  const denied = permission === "denied";
  const unsupported = permission === "unsupported";

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-cyan-50/50 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-500/25">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">Phone & desktop alerts</p>
          <p className="text-sm text-slate-600 mt-1">
            Get real system notifications for tasks, messages, and project updates—even
            when Tobedone is in the background. On iPhone, add Tobedone to your Home
            Screen first, then enable alerts here.
          </p>
        </div>
      </div>

      {unsupported ? (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          This browser does not support notifications.
        </p>
      ) : denied ? (
        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          Notifications are blocked. Open your browser site settings and allow
          notifications for this site.
        </p>
      ) : (
        <Button
          type="button"
          onClick={enable}
          disabled={enabled}
          className={
            enabled
              ? "bg-emerald-600 hover:bg-emerald-600"
              : "bg-violet-600 hover:bg-violet-700"
          }
        >
          {enabled ? (
            <>
              <Bell className="h-4 w-4" />
              Alerts enabled
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              Enable alerts
            </>
          )}
        </Button>
      )}
    </div>
  );
}
