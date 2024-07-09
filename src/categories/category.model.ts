import { Schema, Types } from 'mongoose';

export interface Category extends Document {
  _id: Types.ObjectId;
  name: string;
  desc: string;
}

export const CategorySchema = new Schema({
  _id: { type: Schema.Types.ObjectId },
  name: { type: String, required: true },
  desc: { type: String, required: true },
});
