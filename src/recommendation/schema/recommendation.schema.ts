import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Recommendation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ReviewPost', required: true })
  post1: string;

  @Prop({ type: Types.ObjectId, ref: 'ReviewPost', required: true })
  post2: string;

  @Prop({ type: Number })
  similarity: number;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);
