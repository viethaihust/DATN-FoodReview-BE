import { Schema, Document, Types } from 'mongoose';

export interface Post extends Document {
  title: string;
  summary: string;
  content: string;
  image: string;
  category: Types.ObjectId;
}

export const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true },
);
