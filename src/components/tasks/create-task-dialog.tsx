"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateTask, useUsers } from "@/hooks/use-api";

interface TaskGroup {
  _id: string;
  name: string;
}

interface CreateTaskDialogProps {
  projectId: string;
  taskGroups: TaskGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateTaskDialog({ projectId, taskGroups, open: externalOpen, onOpenChange: setExternalOpen }: CreateTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? setExternalOpen! : setInternalOpen;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [taskGroupId, setTaskGroupId] = useState(taskGroups[0]?._id || "");
  const [userSearch, setUserSearch] = useState("");

  const createTask = useCreateTask();
  const { data: usersData } = useUsers(userSearch);
  const users = usersData as { _id: string; name: string }[] | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskGroupId) return;

    await createTask.mutateAsync({
      projectId,
      taskGroupId,
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      mentionedUsers: mentionedUsers.length ? mentionedUsers : undefined,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignedTo("");
    setOpen(false);
  };

  if (taskGroups.length === 0) {
    return (
      <Button disabled size="sm">
        <Plus className="h-4 w-4" />
        No task groups
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Task Group</Label>
            <Select value={taskGroupId} onValueChange={setTaskGroupId}>
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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assign-search">Assign To</Label>
            <Input
              id="assign-search"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
            />
            {users && users.length > 0 ? (
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
          {users && users.length > 0 && (
            <div className="space-y-2">
              <Label>Mention</Label>
              <div className="flex flex-wrap gap-2">
                {users.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() =>
                      setMentionedUsers((prev) =>
                        prev.includes(u._id)
                          ? prev.filter((id) => id !== u._id)
                          : [...prev, u._id]
                      )
                    }
                    className={`px-2 py-1 rounded-full text-xs border ${
                      mentionedUsers.includes(u._id)
                        ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    @{u.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
