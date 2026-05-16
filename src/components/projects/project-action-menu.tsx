"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckSquare, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectActionMenuProps {
  onAddGroup: () => void;
  onAddTask: () => void;
  canCreateAdminGroup: boolean;
}

export function ProjectActionMenu({
  onAddGroup,
  onAddTask,
  canCreateAdminGroup,
}: ProjectActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <div className="absolute top-full right-0 mt-2 flex flex-col items-end gap-2">
            <motion.button
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              onClick={() => {
                onAddGroup();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <FolderPlus className="h-4 w-4 text-[var(--primary)]" />
              New Group
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                onAddTask();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <CheckSquare className="h-4 w-4 text-[var(--primary)]" />
              New Task
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <Button
        size="sm"
        className={cn(
          "gap-1.5 transition-all shadow-sm",
          open && "bg-slate-800 hover:bg-slate-700 text-white"
        )}
        onClick={() => setOpen(!open)}
      >
        <Plus className={cn("h-4 w-4 transition-transform", open && "rotate-45")} />
        {open ? "Close" : "Create"}
      </Button>
    </div>
  );
}
