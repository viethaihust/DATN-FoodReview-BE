import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  content: string;
  @Prop({ default: 0 })
  likes: number;
  @Prop({ default: 0 })
  replies: number;
  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  likedBy: Types.ObjectId[];
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentCommentId: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
