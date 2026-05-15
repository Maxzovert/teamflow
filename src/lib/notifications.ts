import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import type { NotificationType } from "@/types";

interface CreateNotificationParams {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(params: CreateNotificationParams) {
  await connectDB();

  const notification = await Notification.create({
    recipient: params.recipientId,
    sender: params.senderId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    metadata: params.metadata,
  });

  return notification;
}

export async function createNotifications(
  notifications: CreateNotificationParams[]
) {
  await connectDB();

  const docs = notifications.map((n) => ({
    recipient: n.recipientId,
    sender: n.senderId,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    metadata: n.metadata,
  }));

  return Notification.insertMany(docs);
}
