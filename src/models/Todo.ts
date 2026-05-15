import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITodo extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  sourceTask?: mongoose.Types.ObjectId;
  isImported: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    sourceTask: { type: Schema.Types.ObjectId, ref: "Task" },
    isImported: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

TodoSchema.index({ user: 1, completed: 1 });

export const Todo: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);
