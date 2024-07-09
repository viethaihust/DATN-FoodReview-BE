import { Schema, Document } from 'mongoose';
import { Category } from 'src/categories/category.model';
import { Comment } from 'src/comments/comment.model';

export interface Post extends Document {
  title: string;
  summary: string;
  content: string;
  image: string;
  category: Category;
  comments: Comment[];
}

export const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true },
);
