"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useCreateTask, useUsers, useProjects } from "@/hooks/use-api";

interface TaskGroup {
  _id: string;
  name: string;
  permission?: string;
}

export interface ProjectOption {
  _id: string;
  name: string;
}

interface AssignTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-loaded projects (e.g. from home dashboard) */
  projects?: ProjectOption[];
  defaultProjectId?: string;
  taskGroups?: TaskGroup[];
}

function toId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

export function AssignTaskSheet({
  open,
  onOpenChange,
  projects: projectsProp,
  defaultProjectId,
  taskGroups: externalGroups,
}: AssignTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [taskGroupId, setTaskGroupId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [groups, setGroups] = useState<TaskGroup[]>(externalGroups || []);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const { data: projectsData, isLoading: loadingProjects } = useProjects(open);
  const fetchedProjects = useMemo(() => {
    const list = (projectsData as ProjectOption[]) || [];
    return list.map((p) => ({ _id: toId(p._id), name: p.name }));
  }, [projectsData]);

  const projects = useMemo(() => {
    if (projectsProp?.length) {
      return projectsProp.map((p) => ({ _id: toId(p._id), name: p.name }));
    }
    return fetchedProjects;
  }, [projectsProp, fetchedProjects]);

  const { data: usersData } = useUsers(userSearch);
  const users = (usersData as { _id: string; name: string }[]) || [];
  const createTask = useCreateTask();

  useEffect(() => {
    if (!open) return;
    if (defaultProjectId) {
      setProjectId(toId(defaultProjectId));
      return;
    }
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0]._id);
    }
  }, [open, defaultProjectId, projects, projectId]);

  useEffect(() => {
    if (externalGroups) {
      setGroups(externalGroups.map((g) => ({ ...g, _id: toId(g._id) })));
      if (externalGroups[0]) setTaskGroupId(toId(externalGroups[0]._id));
    }
  }, [externalGroups]);

  useEffect(() => {
    if (!projectId || externalGroups) return;

    setLoadingGroups(true);
    setTaskGroupId("");
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const gs = (json.data.taskGroups || []).map((g: TaskGroup) => ({
            ...g,
            _id: toId(g._id),
          }));
          setGroups(gs);
          if (gs[0]) setTaskGroupId(gs[0]._id);
        } else {
          setGroups([]);
        }
      })
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false));
  }, [projectId, externalGroups]);

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    setTaskGroupId("");
    if (!externalGroups) setGroups([]);
  };

  const toggleMention = (userId: string) => {
    setMentionedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !taskGroupId) return;

    await createTask.mutateAsync({
      projectId,
      taskGroupId,
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      mentionedUsers,
    });

    setTitle("");
    setDescription("");
    setAssignedTo("");
    setMentionedUsers([]);
    onOpenChange(false);
  };

  const canPickProject = !defaultProjectId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Project</Label>
            {loadingProjects && projects.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-slate-500 py-2">
                No projects yet. Create a project first.
              </p>
            ) : (
              <Select
                value={projectId}
                onValueChange={handleProjectChange}
                disabled={!canPickProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {projectId && (
            <div className="space-y-2">
              <Label>Task Group</Label>
              {loadingGroups ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading groups...
                </div>
              ) : groups.length === 0 ? (
                <p className="text-sm text-slate-500 py-2">
                  No task groups in this project.
                </p>
              ) : (
                <Select value={taskGroupId} onValueChange={setTaskGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g._id} value={g._id}>
                        {g.name}
                        {g.permission === "admin" ? " (Admin)" : " (Open)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!projectId || !taskGroupId}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              disabled={!projectId || !taskGroupId}
            />
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
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
            />
            {users.length > 0 && (
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={toId(u._id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mention Users</Label>
            <div className="flex flex-wrap gap-2">
              {users.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => toggleMention(toId(u._id))}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    mentionedUsers.includes(toId(u._id))
                      ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  @{u.name}
                </button>
              ))}
            </div>
            {userSearch.length < 2 && (
              <p className="text-xs text-slate-400">Search to find users to mention</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              createTask.isPending ||
              !projectId ||
              !taskGroupId ||
              projects.length === 0
            }
          >
            {createTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create & Assign"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
