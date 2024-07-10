import { Schema, Document, Types } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  name: string;
}

export const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);
