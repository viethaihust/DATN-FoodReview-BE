import { Schema, Document } from 'mongoose';
import { User } from 'src/users/user.model';

export interface Comment extends Document {
  user: User;
  content: string;
  likes: number;
  replies: Comment[];
  postId?: string;
  parentCommentId?: string;
}

export const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  },
  { timestamps: true },
);
