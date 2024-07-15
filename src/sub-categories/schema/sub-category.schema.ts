import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SubCategory extends Document {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  slug: string;
  @Prop({ required: true })
  description: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
