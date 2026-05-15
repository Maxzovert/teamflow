import mongoose, { Schema, Document, Model } from "mongoose";
import type { GroupPermission } from "@/types";

export interface IDiscussionGroup extends Document {
  _id: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  permission: GroupPermission;
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionGroupSchema = new Schema<IDiscussionGroup>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    permission: {
      type: String,
      enum: ["admin", "open"],
      default: "open",
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const DiscussionGroup: Model<IDiscussionGroup> =
  mongoose.models.DiscussionGroup ||
  mongoose.model<IDiscussionGroup>("DiscussionGroup", DiscussionGroupSchema);
