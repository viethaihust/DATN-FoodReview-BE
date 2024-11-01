import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  receiver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'ReviewPost' })
  postId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
