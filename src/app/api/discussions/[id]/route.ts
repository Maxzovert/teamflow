import { connectDB } from "@/lib/db";
import { DiscussionGroup } from "@/models/DiscussionGroup";
import { TaskGroup } from "@/models/TaskGroup";
import { apiSuccess, apiError, requireApiAuth } from "@/lib/api-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireApiAuth();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const group = await DiscussionGroup.findById(id)
    .populate("members", "name email avatar")
    .populate("project", "name color icon");

  if (!group) return apiError("Discussion group not found", 404);

  const taskGroups = await TaskGroup.find({ project: group.project }).select(
    "name permission"
  );

  return apiSuccess({
    _id: group._id.toString(),
    name: group.name,
    projectId: group.project._id.toString(),
    projectName: (group.project as { name?: string }).name,
    members: group.members,
    taskGroups,
  });
}
