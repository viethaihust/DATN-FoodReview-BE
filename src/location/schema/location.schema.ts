import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Location extends Document {
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
}

export const LocationSchema = SchemaFactory.createForClass(Location);
