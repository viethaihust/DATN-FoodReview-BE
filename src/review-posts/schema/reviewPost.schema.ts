import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ReviewPost extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  files: string[];
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;
  @Prop({ type: Number, default: 0, required: true })
  likesCount: number;
  @Prop({
    type: {
      overall: { type: Number, default: 0, required: true },
      flavor: { type: Number, default: 0, required: true },
      space: { type: Number, default: 0, required: true },
      hygiene: { type: Number, default: 0, required: true },
      price: { type: Number, default: 0, required: true },
      serves: { type: Number, default: 0, required: true },
    },
    required: true,
  })
  ratings: {
    overall: number;
    flavor: number;
    space: number;
    hygiene: number;
    price: number;
    serves: number;
  };
}

export const ReviewPostSchema = SchemaFactory.createForClass(ReviewPost);
