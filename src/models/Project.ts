import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectMember {
  user: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  color: string;
  /** Single emoji shown in discussions sidebar */
  icon?: string;
  /** Unique code others use to join this project */
  joinCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [ProjectMemberSchema],
    color: { type: String, default: "#6366f1" },
    icon: { type: String, trim: true, maxlength: 8 },
    joinCode: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
      maxlength: 12,
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ joinCode: 1 }, { unique: true, sparse: true });

export const Project: Model<IProject> =
  mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
