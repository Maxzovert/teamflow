"use client";

import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";

export interface TodoData {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  isImported?: boolean;
}

interface TodoItemProps {
  todo: TodoData;
  onToggle: (id: string, completed: boolean) => void;
  isUpdating?: boolean;
}

const priorityVariant = {
  low: "secondary" as const,
  medium: "secondary" as const,
  high: "warning" as const,
};

export function TodoItem({ todo, onToggle, isUpdating }: TodoItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 transition-all",
        todo.completed && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(todo._id, !todo.completed)}
        disabled={isUpdating}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5",
          todo.completed
            ? "bg-indigo-600 border-indigo-600 text-white"
            : "border-slate-200 hover:border-indigo-400"
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : todo.completed ? (
          <Check className="h-3.5 w-3.5" />
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium text-slate-900",
            todo.completed && "line-through text-slate-500"
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-sm text-slate-500 mt-0.5">{todo.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={priorityVariant[todo.priority]}>{todo.priority}</Badge>
          {todo.dueDate && (
            <span className="text-xs text-slate-500">Due {formatDate(todo.dueDate)}</span>
          )}
          {todo.isImported && (
            <Badge variant="secondary">From task</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
