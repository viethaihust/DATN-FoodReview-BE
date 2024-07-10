import { Schema, Document, Types } from 'mongoose';

export interface Comment extends Document {
  user: Types.ObjectId;
  content: string;
  likes: number;
  likedBy: Types.ObjectId[];
  replies: Types.ObjectId[];
  postId?: Types.ObjectId;
  parentCommentId?: Types.ObjectId;
}

export const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true },
);
