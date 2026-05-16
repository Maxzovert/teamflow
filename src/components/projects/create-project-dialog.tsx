"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateProject } from "@/hooks/use-api";
import { PROJECT_EMOJI_OPTIONS } from "@/lib/project-icon";
import { cn } from "@/lib/utils";

const COLORS = [
  "#BDE0FE", // Pastel Blue
  "#CDB4DB", // Pastel Purple
  "#FFC8DD", // Pastel Pink
  "#FFAFCC", // Pastel Dark Pink
  "#FFDFBA", // Pastel Orange
  "#CAFFBF", // Pastel Green
  "#FDFFB6", // Pastel Yellow
];

interface CreateProjectDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function CreateProjectDialog({
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_EMOJI_OPTIONS[0]);
  const createProject = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync({ name, description, color, icon });
    setName("");
    setDescription("");
    setColor(COLORS[0]);
    setIcon(PROJECT_EMOJI_OPTIONS[0]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[95vw] sm:max-w-[425px] p-6 rounded-[24px] gap-6 border-0 shadow-xl bg-white/70 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 tracking-tight">Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-semibold text-gray-600">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              required
              className="w-full rounded-2xl border-gray-200/80 bg-gray-50/50 px-4 py-6 text-base focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc" className="text-sm font-semibold text-gray-600">Description</Label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full rounded-2xl border-gray-200/80 bg-gray-50/50 px-4 py-4 text-base focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400 transition-all resize-none"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-600">Group icon</Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={2}
                className="w-16 h-16 text-center text-3xl p-0 rounded-2xl border-gray-200/80 bg-gray-50/50 focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400 transition-all flex-shrink-0"
                placeholder="📁"
              />
              <div className="flex flex-wrap gap-2">
                {PROJECT_EMOJI_OPTIONS.slice(0, 6).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-2xl transition-all duration-200 active:scale-95 border",
                      icon === emoji
                        ? "bg-blue-50/80 border-blue-300 shadow-sm scale-105"
                        : "bg-gray-50/50 border-gray-100 hover:bg-gray-100/80 hover:scale-105"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Type any emoji or use OS picker (Win + . / Cmd + Ctrl + Space)</p>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-600">Theme Color</Label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-all duration-200 active:scale-95",
                    color === c ? "ring-2 ring-offset-2 ring-gray-300 scale-110 shadow-sm" : "hover:scale-110 shadow-sm"
                  )}
                  style={{
                    backgroundColor: c,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full rounded-2xl py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={createProject.isPending}
            >
              {createProject.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
