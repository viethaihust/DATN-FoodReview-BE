import { Schema, Document, Types } from 'mongoose';

export interface User extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  posts: Types.ObjectId[];
  comments: Types.ObjectId[];
}

export const UserSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true },
);
