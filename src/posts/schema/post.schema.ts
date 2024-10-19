import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  summary: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  images: string[];
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  subCategory: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
