"use client";

import { useEffect, useRef, useState } from "react";
import { Hash, Plus, Shield, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDiscussionDialog } from "@/components/projects/create-discussion-dialog";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { cn } from "@/lib/utils";

interface DiscussionsAddMenuProps {
  projectId: string | null;
  /** global = new group creates a project; project = new group creates admin-only discussion */
  mode: "global" | "project";
  canCreateAdminGroup?: boolean;
}

export function DiscussionsAddMenu({
  projectId,
  mode,
  canCreateAdminGroup = false,
}: DiscussionsAddMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const [adminGroupOpen, setAdminGroupOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const openChannel = () => {
    if (!projectId) return;
    setMenuOpen(false);
    setChannelOpen(true);
  };

  const openGroup = () => {
    setMenuOpen(false);
    if (mode === "global") {
      setProjectOpen(true);
    } else if (canCreateAdminGroup && projectId) {
      setAdminGroupOpen(true);
    }
  };

  const groupDisabled = mode === "project" && !canCreateAdminGroup;
  const groupLabel =
    mode === "global" ? "New group" : "Admin-only group";
  const groupHint = groupDisabled
    ? "Only project admins can create this"
    : mode === "global"
      ? "New project with its own channels"
      : "Visible only to project admins";

  return (
    <div className="relative shrink-0" ref={ref}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Add channel or group"
        aria-expanded={menuOpen}
      >
        <Plus className="h-5 w-5" />
      </Button>

      {menuOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-slate-200",
            "bg-white shadow-lg py-1 z-50"
          )}
        >
          <button
            type="button"
            disabled={!projectId}
            onClick={openChannel}
            className={cn(
              "flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors",
              projectId
                ? "text-slate-700 hover:bg-slate-50"
                : "text-slate-400 cursor-not-allowed"
            )}
          >
            <Hash className="h-4 w-4 mt-0.5 shrink-0 text-indigo-600" />
            <span>
              <span className="font-medium block">New channel</span>
              <span className="text-xs text-slate-500">
                {projectId ? "Open to all project members" : "Select a group first"}
              </span>
            </span>
          </button>
          <button
            type="button"
            disabled={groupDisabled}
            onClick={openGroup}
            className={cn(
              "flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors",
              groupDisabled
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-50"
            )}
          >
            {mode === "global" ? (
              <FolderPlus className="h-4 w-4 mt-0.5 shrink-0 text-indigo-600" />
            ) : (
              <Shield className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            )}
            <span>
              <span className="font-medium block">{groupLabel}</span>
              <span className="text-xs text-slate-500">{groupHint}</span>
            </span>
          </button>
        </div>
      )}

      {projectId && (
        <CreateDiscussionDialog
          projectId={projectId}
          permission="open"
          open={channelOpen}
          onOpenChange={setChannelOpen}
          hideTrigger
        />
      )}

      {projectId && canCreateAdminGroup && mode === "project" && (
        <CreateDiscussionDialog
          projectId={projectId}
          permission="admin"
          open={adminGroupOpen}
          onOpenChange={setAdminGroupOpen}
          hideTrigger
        />
      )}

      {mode === "global" && (
        <CreateProjectDialog
          open={projectOpen}
          onOpenChange={setProjectOpen}
          hideTrigger
        />
      )}
    </div>
  );
}
