"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateTask } from "@/hooks/use-api";

export interface ChatMember {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface TaskGroupOption {
  _id: string;
  name: string;
}

interface ChatAssignTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskGroups: TaskGroupOption[];
  members: ChatMember[];
  defaultAssigneeId?: string;
  onAssigned: (message: string) => void;
}

export function ChatAssignTaskDialog({
  open,
  onOpenChange,
  projectId,
  taskGroups,
  members,
  defaultAssigneeId,
  onAssigned,
}: ChatAssignTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState(defaultAssigneeId || "");
  const [taskGroupId, setTaskGroupId] = useState("");

  const createTask = useCreateTask();

  useEffect(() => {
    if (open) {
      setAssignedTo(defaultAssigneeId || members[0]?._id || "");
      setTaskGroupId(taskGroups[0]?._id || "");
    }
  }, [open, defaultAssigneeId, members, taskGroups]);

  const assignee = members.find((m) => m._id === assignedTo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo || !taskGroupId) return;

    await createTask.mutateAsync({
      projectId,
      taskGroupId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignedTo,
      mentionedUsers: [assignedTo],
    });

    const mention = assignee ? `@${assignee.name}` : "there";
    const text = `${mention} 📋 You've been assigned a task: ${title.trim()}`;
    onAssigned(text);
    setTitle("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign task from chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Assign to</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m._id} value={m._id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Task group</Label>
            <Select value={taskGroupId} onValueChange={setTaskGroupId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {taskGroups.map((g) => (
                  <SelectItem key={g._id} value={g._id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700"
            disabled={createTask.isPending || taskGroups.length === 0}
          >
            {createTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Assign & post in chat"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
