import mongoose, { Schema, Document, Model } from "mongoose";
import type { GroupPermission } from "@/types";

export interface ITaskGroup extends Document {
  _id: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  icon?: string;
  permission: GroupPermission;
  admins: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskGroupSchema = new Schema<ITaskGroup>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    icon: { type: String },
    permission: {
      type: String,
      enum: ["admin", "open"],
      default: "open",
    },
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const TaskGroup: Model<ITaskGroup> =
  mongoose.models.TaskGroup ||
  mongoose.model<ITaskGroup>("TaskGroup", TaskGroupSchema);
