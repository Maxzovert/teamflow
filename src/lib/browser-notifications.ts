export type AppNotificationPayload = {
  title: string;
  message: string;
  link?: string;
  tag?: string;
};

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (getNotificationPermission() === "unsupported") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function shouldShowSystemNotification(link?: string): boolean {
  if (getNotificationPermission() !== "granted") return false;
  if (typeof document !== "undefined" && document.hidden) return true;
  if (!link || typeof window === "undefined") return false;
  try {
    const target = new URL(link, window.location.origin);
    const current = `${window.location.pathname}${window.location.search}`;
    return target.pathname + target.search !== current;
  } catch {
    return true;
  }
}

export async function showAppNotification(payload: AppNotificationPayload): Promise<void> {
  if (getNotificationPermission() !== "granted") return;

  const options: NotificationOptions = {
    body: payload.message,
    tag: payload.tag || payload.title,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.link || "/notifications" },
  };

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(payload.title, options);
      return;
    }
  } catch {
    /* fall through */
  }

  const n = new Notification(payload.title, options);
  n.onclick = () => {
    window.focus();
    if (payload.link) window.location.href = payload.link;
    n.close();
  };
}
