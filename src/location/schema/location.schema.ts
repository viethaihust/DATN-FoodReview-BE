import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Location extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  address: string;
  @Prop({ required: false })
  province: string;
  @Prop({
    required: true,
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  })
  latLong: {
    lat: number;
    lng: number;
  };
  @Prop({ required: false })
  averageRating?: number;
  @Prop({ required: false })
  totalRatingsCount?: number;
}

export const LocationSchema = SchemaFactory.createForClass(Location);
