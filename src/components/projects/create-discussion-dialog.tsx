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
import { useCreateDiscussionGroup } from "@/hooks/use-api";

interface CreateDiscussionDialogProps {
  projectId: string;
  permission?: "open" | "admin";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function CreateDiscussionDialog({
  projectId,
  permission = "open",
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: CreateDiscussionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createDiscussion = useCreateDiscussionGroup(projectId);
  const isAdminGroup = permission === "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDiscussion.mutateAsync({ name, description, permission });
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-5 w-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isAdminGroup ? "New admin-only group" : "New channel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="disc-name">Name</Label>
            <Input
              id="disc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                isAdminGroup ? "e.g. leadership, admins" : "e.g. announcements, design"
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disc-desc">Description (optional)</Label>
            <Textarea
              id="disc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          {isAdminGroup && (
            <p className="text-xs text-slate-500 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
              Only project admins can see and use this group. All admins are added
              automatically.
            </p>
          )}
          <Button type="submit" className="w-full" disabled={createDiscussion.isPending}>
            {createDiscussion.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAdminGroup ? (
              "Create admin group"
            ) : (
              "Create channel"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
