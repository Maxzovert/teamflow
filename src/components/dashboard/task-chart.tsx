"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TaskStats {
  total: number;
  pending: number;
  accepted: number;
  inProgress: number;
  completed: number;
  rejected: number;
}

interface PriorityBreakdown {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

interface TaskChartProps {
  taskStats?: TaskStats;
  priorityBreakdown?: PriorityBreakdown;
  isLoading?: boolean;
}

const statusBars = [
  { key: "pending" as const, label: "Pending", color: "bg-amber-500" },
  { key: "accepted" as const, label: "Accepted", color: "bg-blue-500" },
  { key: "inProgress" as const, label: "In Progress", color: "bg-violet-500" },
  { key: "completed" as const, label: "Completed", color: "bg-emerald-500" },
  { key: "rejected" as const, label: "Rejected", color: "bg-red-500" },
];

const priorityBars = [
  { key: "low" as const, label: "Low", color: "bg-zinc-500" },
  { key: "medium" as const, label: "Medium", color: "bg-blue-500" },
  { key: "high" as const, label: "High", color: "bg-amber-500" },
  { key: "urgent" as const, label: "Urgent", color: "bg-red-500" },
];

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-600 font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TaskChart({
  taskStats,
  priorityBreakdown,
  isLoading,
}: TaskChartProps) {
  const statusMax = taskStats
    ? Math.max(
        taskStats.pending,
        taskStats.accepted,
        taskStats.inProgress,
        taskStats.completed,
        taskStats.rejected,
        1
      )
    : 1;

  const priorityMax = priorityBreakdown
    ? Math.max(
        priorityBreakdown.low,
        priorityBreakdown.medium,
        priorityBreakdown.high,
        priorityBreakdown.urgent,
        1
      )
    : 1;

  return (
    <Card animate={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          Task Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-slate-50" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                By Status
              </p>
              {statusBars.map((bar) => (
                <BarRow
                  key={bar.key}
                  label={bar.label}
                  value={taskStats?.[bar.key] ?? 0}
                  max={statusMax}
                  color={bar.color}
                />
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                By Priority
              </p>
              {priorityBars.map((bar) => (
                <BarRow
                  key={bar.key}
                  label={bar.label}
                  value={priorityBreakdown?.[bar.key] ?? 0}
                  max={priorityMax}
                  color={bar.color}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
