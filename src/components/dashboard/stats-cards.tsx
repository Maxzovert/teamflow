"use client";

import {
  CheckCircle2,
  Clock,
  ListTodo,
  Loader2,
  Target,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TaskStats {
  total: number;
  pending: number;
  accepted: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

interface StatsCardsProps {
  taskStats?: TaskStats;
  todoStats?: TodoStats;
  isLoading?: boolean;
}

const statConfig = [
  {
    key: "total" as const,
    label: "Total Tasks",
    icon: Target,
    color: "from-violet-600 to-indigo-600",
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    icon: Loader2,
    color: "from-blue-600 to-cyan-600",
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    color: "from-emerald-600 to-teal-600",
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Clock,
    color: "from-amber-600 to-orange-600",
  },
];

export function StatsCards({ taskStats, todoStats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} animate={false} className="h-28 animate-pulse bg-slate-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((stat) => {
        const Icon = stat.icon;
        const value = taskStats?.[stat.key] ?? 0;

        return (
          <Card key={stat.label} animate>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg",
                    stat.color
                  )}
                >
                  <Icon className="h-5 w-5 text-slate-900" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {todoStats && (
        <Card animate className="sm:col-span-2 lg:col-span-4">
          <CardContent className="flex flex-wrap items-center gap-6 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-rose-600">
                <ListTodo className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Personal Todos</p>
                <p className="text-lg font-semibold text-slate-900">
                  {todoStats.completed}/{todoStats.total} completed
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400">
                {todoStats.completed} done
              </span>
              <span className="text-amber-400">
                {todoStats.pending} pending
              </span>
              {taskStats && taskStats.rejected > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="h-4 w-4" />
                  {taskStats.rejected} rejected
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
