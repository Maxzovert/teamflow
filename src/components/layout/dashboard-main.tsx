"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullHeightChat = pathname === "/discussions";

  return (
    <div
      className={cn(
        "flex-1 min-h-0",
        isFullHeightChat
          ? "flex flex-col overflow-hidden"
          : "overflow-y-auto pb-20 lg:pb-0"
      )}
    >
      {children}
    </div>
  );
}
