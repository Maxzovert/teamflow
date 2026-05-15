"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateProjectIcon } from "@/hooks/use-api";
import { PROJECT_EMOJI_OPTIONS, getProjectDisplayIcon } from "@/lib/project-icon";
import { cn } from "@/lib/utils";

interface ProjectIconPickerProps {
  projectId: string;
  projectName: string;
  icon?: string;
  className?: string;
  /** Compact trigger shown on the icon rail */
  variant?: "rail" | "button";
}

export function ProjectIconPicker({
  projectId,
  projectName,
  icon,
  className,
  variant = "rail",
}: ProjectIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(getProjectDisplayIcon(icon));
  const [custom, setCustom] = useState("");
  const updateIcon = useUpdateProjectIcon(projectId);

  useEffect(() => {
    if (open) {
      setSelected(getProjectDisplayIcon(icon));
      setCustom(icon?.trim() && !PROJECT_EMOJI_OPTIONS.includes(icon.trim()) ? icon.trim() : "");
    }
  }, [open, icon]);

  const handleSave = async () => {
    const value = (custom.trim() || selected).slice(0, 8);
    await updateIcon.mutateAsync(value);
    setOpen(false);
  };

  return (
    <>
      {variant === "rail" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            "absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full",
            "bg-white border border-slate-200 text-slate-500 shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-600",
            className
          )}
          title={`Change icon for ${projectName}`}
          aria-label={`Change icon for ${projectName}`}
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
          onClick={() => setOpen(true)}
        >
          <span className="text-lg mr-2">{getProjectDisplayIcon(icon)}</span>
          Change icon
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Icon for {projectName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-6 gap-2">
              {PROJECT_EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setSelected(emoji);
                    setCustom("");
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-colors",
                    selected === emoji && !custom
                      ? "bg-indigo-100 ring-2 ring-indigo-500"
                      : "hover:bg-slate-100"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Or paste any emoji</p>
              <Input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="e.g. 🦄"
                maxLength={8}
                className="text-center text-xl"
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={updateIcon.isPending}
              onClick={handleSave}
            >
              {updateIcon.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save icon"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
