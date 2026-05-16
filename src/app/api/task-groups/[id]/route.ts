import { connectDB } from "@/lib/db";
import { TaskGroup } from "@/models/TaskGroup";
import { Project } from "@/models/Project";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const group = await TaskGroup.findById(id).populate("project", "name color icon");

  if (!group) return apiError("Task group not found", 404);

  const project = await Project.findById(group.project).populate("members.user", "name email avatar");
  const members = project?.members.map(m => m.user) || [];

  const taskGroups = await TaskGroup.find({ project: group.project }).select(
    "name permission"
  );

  return apiSuccess({
    _id: group._id.toString(),
    name: group.name,
    projectId: group.project._id.toString(),
    projectName: (group.project as { name?: string }).name,
    members: members,
    taskGroups,
  });
}
