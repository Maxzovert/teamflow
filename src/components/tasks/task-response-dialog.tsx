"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRespondToTask } from "@/hooks/use-api";

interface TaskResponseDialogProps {
  taskId: string;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskResponseDialog({
  taskId,
  taskTitle,
  open,
  onOpenChange,
}: TaskResponseDialogProps) {
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const respond = useRespondToTask();

  const handleSubmit = async () => {
    if (!action) return;

    await respond.mutateAsync({
      taskId,
      action,
      notes: action === "accept" ? notes : undefined,
      reason: action === "reject" ? reason : undefined,
    });

    setAction(null);
    setNotes("");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Respond to Task</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 mb-4">{taskTitle}</p>

        {!action ? (
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => setAction("accept")}>
              Accept
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setAction("reject")}
            >
              Reject
            </Button>
          </div>
        ) : action === "accept" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accept-notes">Notes (optional)</Label>
              <Textarea
                id="accept-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about accepting this task..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setAction(null)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={respond.isPending}>
                {respond.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm Accept"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason</Label>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you rejecting this task?"
                rows={3}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setAction(null)}>
                Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleSubmit}
                disabled={respond.isPending || !reason.trim()}
              >
                {respond.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm Reject"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
