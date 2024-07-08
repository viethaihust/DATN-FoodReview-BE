import { Schema } from 'mongoose';

export interface Category extends Document {
  name: string;
  desc: string;
}

export const CategorySchema = new Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
});
