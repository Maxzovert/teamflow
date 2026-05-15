"use client";

import { useState } from "react";
import { Copy, Check, KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface ProjectJoinCodeCardProps {
  joinCode: string;
  className?: string;
  onClose?: () => void;
}

export function ProjectJoinCodeCard({
  joinCode,
  className,
  onClose,
}: ProjectJoinCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-cyan-50/40 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100">
          <KeyRound className="h-5 w-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">Project join code</p>
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-slate-500"
                onClick={onClose}
                aria-label="Close join code"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 mb-2">
            Only admins can see this. Share it so others can join without an email
            invite.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white border border-violet-200 px-3 py-2 text-lg font-mono font-semibold tracking-[0.2em] text-violet-700">
              {joinCode}
            </code>
            <Button type="button" variant="outline" size="icon" onClick={copy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

