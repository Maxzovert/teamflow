import { connectDB } from "@/lib/db";
import { Activity } from "@/models/Activity";

interface LogActivityParams {
  projectId: string;
  userId: string;
  action: string;
  entityType: "task" | "project" | "message" | "todo" | "member";
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: LogActivityParams) {
  await connectDB();

  return Activity.create({
    project: params.projectId,
    user: params.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata,
  });
}
