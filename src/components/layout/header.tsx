"use client";

import { useSession } from "next-auth/react";
import { Bell, ArrowLeft } from "lucide-react";
import { HeaderSettingsMenu } from "@/components/layout/header-settings-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotificationStore } from "@/stores/notification-store";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
}

export function Header({ title, subtitle, backHref }: HeaderProps) {
  const { data: session } = useSession();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-white px-4 lg:px-6 py-4">
      <div className="flex items-center gap-3 min-w-0">
        {backHref && (
          <Link href={backHref} className="shrink-0 p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/notifications" className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-slate-900 leading-none">
              {session?.user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate max-w-[140px]">
              {session?.user?.designation || (
                <span className="capitalize">{session?.user?.role}</span>
              )}
            </p>
          </div>
        </div>

        <HeaderSettingsMenu />
      </div>
    </header>
  );
}
