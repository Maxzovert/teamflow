"use client";

import { useState } from "react";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/types";
import { TaskResponseDialog } from "./task-response-dialog";

interface TaskUser {
  _id: string;
  name: string;
  avatar?: string;
}

export interface TaskData {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: TaskUser;
  createdBy?: TaskUser;
}

interface TaskCardProps {
  task: TaskData;
  currentUserId?: string;
  showRespond?: boolean;
}

const statusVariant: Record<
  TaskStatus,
  "default" | "secondary" | "success" | "warning" | "danger"
> = {
  pending: "warning",
  accepted: "default",
  rejected: "danger",
  in_progress: "default",
  completed: "success",
};

const priorityVariant: Record<TaskPriority, "secondary" | "warning" | "danger" | "urgent"> = {
  low: "secondary",
  medium: "default" as "secondary",
  high: "warning",
  urgent: "urgent",
};

export function TaskCard({ task, currentUserId, showRespond = true }: TaskCardProps) {
  const [responseOpen, setResponseOpen] = useState(false);
  const canRespond =
    showRespond &&
    task.status === "pending" &&
    task.assignedTo?._id === currentUserId;

  return (
    <>
      <Card animate={false}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-900 truncate">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant={statusVariant[task.status]}>
                  {task.status.replace("_", " ")}
                </Badge>
                <Badge variant={priorityVariant[task.priority]}>
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                {task.assignedTo && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <User className="h-3 w-3" />
                    {task.assignedTo.name}
                  </span>
                )}
              </div>
            </div>
            {canRespond && (
              <Button size="sm" onClick={() => setResponseOpen(true)}>
                Respond
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {canRespond && (
        <TaskResponseDialog
          taskId={task._id}
          taskTitle={task.title}
          open={responseOpen}
          onOpenChange={setResponseOpen}
        />
      )}
    </>
  );
}
