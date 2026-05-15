import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { Todo } from "@/models/Todo";
import { Activity } from "@/models/Activity";
import { apiSuccess, requireApiAuth } from "@/lib/api-utils";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();
  const userId = new mongoose.Types.ObjectId(user!.id);

  const projects = await Project.find({ "members.user": userId })
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar")
    .sort({ updatedAt: -1 })
    .limit(12);

  const projectIds = projects.map((p) => p._id);
  const taskFilter = {
    $or: [{ assignedTo: userId }, { createdBy: userId }],
  };

  const [todos, assignedTasks, taskStatsAgg, priorityAgg, activities] =
    await Promise.all([
      Todo.find({ user: userId }).sort({ completed: 1, createdAt: -1 }).limit(20),
      Task.find({ assignedTo: userId })
        .populate("assignedTo", "name email avatar")
        .populate("createdBy", "name email avatar")
        .populate("project", "name color")
        .sort({ createdAt: -1 })
        .limit(10),
      Task.aggregate([
        { $match: taskFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Task.aggregate([
        { $match: taskFilter },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),
      Activity.find({ project: { $in: projectIds } })
        .populate("user", "name email avatar")
        .sort({ createdAt: -1 })
        .limit(15),
    ]);

  const statusCounts = Object.fromEntries(
    taskStatsAgg.map((row: { _id: string; count: number }) => [row._id, row.count])
  );
  const totalTasks = taskStatsAgg.reduce(
    (sum: number, row: { count: number }) => sum + row.count,
    0
  );

  const taskStats = {
    total: totalTasks,
    pending: statusCounts.pending || 0,
    accepted: statusCounts.accepted || 0,
    inProgress: statusCounts.in_progress || 0,
    completed: statusCounts.completed || 0,
    rejected: statusCounts.rejected || 0,
  };

  const priorityCounts = Object.fromEntries(
    priorityAgg.map((row: { _id: string; count: number }) => [row._id, row.count])
  );

  const todoStats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
    imported: todos.filter((t) => t.isImported).length,
  };

  const priorityBreakdown = {
    low: priorityCounts.low || 0,
    medium: priorityCounts.medium || 0,
    high: priorityCounts.high || 0,
    urgent: priorityCounts.urgent || 0,
  };

  return apiSuccess({
    projects,
    todos,
    todoStats,
    assignedTasks,
    taskStats,
    priorityBreakdown,
    activities,
  });
}
