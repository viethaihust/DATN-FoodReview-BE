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
  @Prop({ required: false })
  image?: string;
  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role: string;
  @Prop({ default: false })
  banned: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
