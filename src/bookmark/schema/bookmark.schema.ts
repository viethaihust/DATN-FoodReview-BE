import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Bookmark extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'ReviewPost', required: true })
  postId: Types.ObjectId;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
