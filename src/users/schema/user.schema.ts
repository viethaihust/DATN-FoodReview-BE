import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  email: string;
  @Prop({ required: false })
  password?: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
