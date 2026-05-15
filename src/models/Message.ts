import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReaction {
  emoji: string;
  users: mongoose.Types.ObjectId[];
}

export interface IReadReceipt {
  user: mongoose.Types.ObjectId;
  readAt: Date;
}

export interface IAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  discussionGroup: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachments: IAttachment[];
  reactions: IReaction[];
  readBy: IReadReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

const ReadReceiptSchema = new Schema<IReadReceipt>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AttachmentSchema = new Schema<IAttachment>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    discussionGroup: {
      type: Schema.Types.ObjectId,
      ref: "DiscussionGroup",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    attachments: [AttachmentSchema],
    reactions: [ReactionSchema],
    readBy: [ReadReceiptSchema],
  },
  { timestamps: true }
);

MessageSchema.index({ discussionGroup: 1, createdAt: -1 });

export const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
