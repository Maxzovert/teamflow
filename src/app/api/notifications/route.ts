import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { apiSuccess, requireApiAuth } from "@/lib/api-utils";

export async function GET() {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  await connectDB();

  const notifications = await Notification.find({
    recipient: new mongoose.Types.ObjectId(user!.id),
  })
    .populate("sender", "name email avatar")
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: new mongoose.Types.ObjectId(user!.id),
    read: false,
  });

  return apiSuccess({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const { user, error } = await requireApiAuth();
  if (error) return error;

  const { markAllRead, notificationId } = await req.json();
  await connectDB();

  if (markAllRead) {
    await Notification.updateMany(
      { recipient: user!.id, read: false },
      { read: true }
    );
    return apiSuccess({ updated: true });
  }

  if (notificationId) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: user!.id },
      { read: true }
    );
  }

  return apiSuccess({ updated: true });
}
