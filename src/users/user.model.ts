import { Schema, Document } from 'mongoose';
import { Comment } from 'src/comments/comment.model';
import { Post } from 'src/posts/post.model';

export interface User extends Document {
  email: string;
  password: string;
  name: string;
  posts: Post[];
  comments: Comment[];
}

export const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true },
);
