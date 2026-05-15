import { connectDB } from "@/lib/db";
import { Todo } from "@/models/Todo";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  await connectDB();

  const todo = await Todo.findOne({ _id: id, user: user!.id });
  if (!todo) return apiError("Todo not found", 404);

  if (body.completed !== undefined) {
    todo.completed = body.completed;
    todo.completedAt = body.completed ? new Date() : undefined;
  }

  if (body.title) todo.title = body.title;
  if (body.description !== undefined) todo.description = body.description;
  if (body.priority) todo.priority = body.priority;

  await todo.save();
  return apiSuccess(todo);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const todo = await Todo.findOneAndDelete({ _id: id, user: user!.id });
  if (!todo) return apiError("Todo not found", 404);

  return apiSuccess({ deleted: true });
}
