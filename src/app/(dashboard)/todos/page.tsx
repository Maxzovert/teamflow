"use client";

import { useState } from "react";
import { CheckSquare, Loader2, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent } from "@/components/ui/card";
import { TodoItem, type TodoData } from "@/components/todos/todo-item";
import { useTodos, useCreateTodo, useUpdateTodo } from "@/hooks/use-api";

interface TodosResponse {
  todos: TodoData[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    imported: number;
  };
}

export default function TodosPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const { data, isLoading } = useTodos();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const response = data as TodosResponse | undefined;
  const todos = response?.todos || [];
  const stats = response?.stats;

  const filtered = todos.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTodo.mutateAsync({ title, priority });
    setTitle("");
    setPriority("medium");
    setOpen(false);
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setUpdatingId(id);
    try {
      await updateTodo.mutateAsync({ id, completed });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <Header title="My Todos" subtitle="Personal task list" />
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <Card animate={false}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total</p>
              </CardContent>
            </Card>
            <Card animate={false}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
                <p className="text-xs text-slate-500">Done</p>
              </CardContent>
            </Card>
            <Card animate={false}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Todo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="todo-title">Title</Label>
                  <Input
                    id="todo-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
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
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={createTodo.isPending}>
                  {createTodo.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Todo"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <CheckSquare className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-500">No todos found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={handleToggle}
                isUpdating={updatingId === todo._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
