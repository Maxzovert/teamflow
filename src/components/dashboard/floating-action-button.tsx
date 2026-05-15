"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckSquare, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onAddTodo: () => void;
  onAssignTask: () => void;
}

export function FloatingActionButton({
  onAddTodo,
  onAssignTask,
}: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              onClick={() => {
                onAssignTask();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-slate-200 shadow-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UserPlus className="h-4 w-4 text-indigo-600" />
              Assign Task
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                onAddTodo();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-white border border-slate-200 shadow-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <CheckSquare className="h-4 w-4 text-indigo-600" />
              Add Todo
            </motion.button>
          </>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-xl shadow-indigo-600/30 transition-transform",
          open && "rotate-45"
        )}
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
}
