import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import { Todo } from "@/models/Todo";
import { Activity } from "@/models/Activity";
import { Project } from "@/models/Project";
import { apiSuccess, requireApiAuth } from "@/lib/api-utils";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();

  const userId = new mongoose.Types.ObjectId(user!.id);

  const projects = await Project.find({ "members.user": userId }).select(
    "_id"
  );
  const projectIds = projects.map((p) => p._id);

  const [tasks, todos, activities] = await Promise.all([
    Task.find({
      $or: [{ assignedTo: userId }, { createdBy: userId }],
    }),
    Todo.find({ user: userId }),
    Activity.find({ project: { $in: projectIds } })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    accepted: tasks.filter((t) => t.status === "accepted").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    rejected: tasks.filter((t) => t.status === "rejected").length,
  };

  const todoStats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
  };

  const priorityBreakdown = {
    low: tasks.filter((t) => t.priority === "low").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    high: tasks.filter((t) => t.priority === "high").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
  };

  return apiSuccess({
    taskStats,
    todoStats,
    priorityBreakdown,
    activities,
    recentTasks: tasks.slice(0, 5),
  });
}
