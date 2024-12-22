import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Viewed extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'ReviewPost', required: true })
  postId: Types.ObjectId;
}

export const ViewedSchema = SchemaFactory.createForClass(Viewed);
