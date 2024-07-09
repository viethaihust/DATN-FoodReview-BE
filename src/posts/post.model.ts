import { Schema, Document, Types } from 'mongoose';

export interface Post extends Document {
  _id: Types.ObjectId;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: Types.ObjectId;
}

export const PostSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true },
);
