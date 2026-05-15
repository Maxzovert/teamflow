"use client";

import { useState } from "react";
import { Plus, Loader2, Shield, Users } from "lucide-react";
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
import { useCreateTaskGroup } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

interface CreateTaskGroupDialogProps {
  projectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  canCreateAdminGroup?: boolean;
}

export function CreateTaskGroupDialog({
  projectId,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  canCreateAdminGroup = true,
}: CreateTaskGroupDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permission, setPermission] = useState<"open" | "admin">("open");

  const createGroup = useCreateTaskGroup(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePermission = canCreateAdminGroup ? permission : "open";
    await createGroup.mutateAsync({ name, description, permission: effectivePermission });
    setName("");
    setDescription("");
    setPermission("open");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
            New Group
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 1, Design, Backend"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-desc">Description</Label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          {canCreateAdminGroup ? (
          <div className="space-y-2">
            <Label>Permission</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPermission("open")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all",
                  permission === "open"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Open</span>
                <span className="text-xs text-slate-500 text-center">
                  Anyone can assign tasks
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPermission("admin")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all",
                  permission === "admin"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 hover:bg-slate-50"
                )}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin</span>
                <span className="text-xs text-slate-500 text-center">
                  Only admins assign tasks
                </span>
              </button>
            </div>
          </div>
          ) : (
            <p className="text-xs text-slate-500 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
              This will be an open group. Only project admins can create admin-only groups.
            </p>
          )}
          <Button type="submit" className="w-full" disabled={createGroup.isPending}>
            {createGroup.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Group"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
