"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Loader2, ChevronDown, ChevronUp, FolderKanban, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ProjectCard, type ProjectData } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { TodoItem, type TodoData } from "@/components/todos/todo-item";
import { TaskCard } from "@/components/tasks/task-card";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TaskChart } from "@/components/dashboard/task-chart";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";
import { AssignTaskSheet } from "@/components/tasks/assign-task-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHomeDashboard, useCreateTodo, useUpdateTodo } from "@/hooks/use-api";

interface HomeData {
  projects: ProjectData[];
  todos: TodoData[];
  todoStats: { total: number; completed: number; pending: number; imported: number };
  assignedTasks: Array<{
    _id: string;
    title: string;
    description?: string;
    status: "pending" | "accepted" | "rejected" | "in_progress" | "completed";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    assignedTo?: { _id: string; name: string; avatar?: string };
    createdBy?: { _id: string; name: string; avatar?: string };
    project?: { _id: string; name: string; color: string };
  }>;
  taskStats: {
    total: number;
    pending: number;
    accepted: number;
    inProgress: number;
    completed: number;
    rejected: number;
  };
  priorityBreakdown: { low: number; medium: number; high: number; urgent: number };
  activities: Array<{
    _id: string;
    action: string;
    entityType: string;
    createdAt: string;
    user?: { _id: string; name: string; avatar?: string };
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, refetch } = useHomeDashboard();
  const home = data as HomeData | undefined;

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [todoOpen, setTodoOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [todoTitle, setTodoTitle] = useState("");
  const [todoPriority, setTodoPriority] = useState("medium");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const pendingTodos = home?.todos?.filter((t) => !t.completed) || [];
  const pendingAssigned =
    home?.assignedTasks?.filter((t) => t.status === "pending") || [];

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTodo.mutateAsync({ title: todoTitle, priority: todoPriority });
    setTodoTitle("");
    setTodoOpen(false);
    refetch();
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    setUpdatingId(id);
    try {
      await updateTodo.mutateAsync({ id, completed });
      refetch();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="relative min-h-full">
      <Header
        title="Tobedone"
        subtitle={`Welcome back, ${session?.user?.name?.split(" ")[0] || "there"}`}
      />

      <div className="px-3 py-4 lg:px-6 lg:py-6 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-28">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
            </div>
            <CreateProjectDialog />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : !home?.projects?.length ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-white">
              <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No projects yet</p>
              <CreateProjectDialog />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {home.projects.map((project, i) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">My Todos</h2>
              <Link href="/todos" className="text-sm text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            {home?.todoStats && (
              <p className="text-xs text-slate-500 mb-3">
                {home.todoStats.pending} pending · {home.todoStats.imported} from tasks
              </p>
            )}
            {pendingTodos.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center rounded-xl border border-slate-200 bg-white">
                No pending todos. Tap + to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingTodos.slice(0, 6).map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                    isUpdating={updatingId === todo._id}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Assigned to You</h2>
            {pendingAssigned.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center rounded-xl border border-slate-200 bg-white">
                No pending assignments
              </p>
            ) : (
              <div className="space-y-3">
                {pendingAssigned.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    currentUserId={session?.user?.id}
                    showRespond
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <section>
          <button
            type="button"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            {showAnalytics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Analytics & Activity
          </button>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-6"
            >
              <StatsCards
                taskStats={home?.taskStats}
                todoStats={home?.todoStats}
                isLoading={isLoading}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <TaskChart
                  taskStats={home?.taskStats}
                  priorityBreakdown={home?.priorityBreakdown}
                  isLoading={isLoading}
                />
                <ActivityTimeline activities={home?.activities} isLoading={isLoading} />
              </div>
            </motion.div>
          )}
        </section>
      </div>

      <FloatingActionButton
        onAddTodo={() => setTodoOpen(true)}
        onAssignTask={() => setAssignOpen(true)}
      />

      <Dialog open={todoOpen} onOpenChange={setTodoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Todo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTodo} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={todoPriority} onValueChange={setTodoPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createTodo.isPending}>
              {createTodo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Todo
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AssignTaskSheet
        open={assignOpen}
        onOpenChange={setAssignOpen}
        projects={home?.projects?.map((p) => ({ _id: p._id, name: p.name }))}
      />
    </div>
  );
}
