import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Recommendation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: Types.ObjectId, ref: 'ReviewPost', required: true })
  postId: string;

  @Prop({ type: Number })
  similarity: number;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
