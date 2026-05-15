import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Todo } from "@/models/Todo";
import { todoSchema } from "@/lib/validations";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();

  const todos = await Todo.find({
    user: new mongoose.Types.ObjectId(user!.id),
  }).sort({ completed: 1, createdAt: -1 });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
    imported: todos.filter((t) => t.isImported).length,
  };

  return apiSuccess({ todos, stats });
}

export async function POST(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = todoSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message);
  }

  await connectDB();

  const todo = await Todo.create({
    user: user!.id,
    title: parsed.data.title,
    description: parsed.data.description,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    priority: parsed.data.priority,
    isImported: false,
  });

  return apiSuccess(todo, 201);
}
