import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ required: true, unique: true, default: '' })
  cnic: string;

  @Prop({ default: '' })
  sessionToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export interface UserInterface {
  _id: ObjectId;
  name: string;
  password?: string;
  cnic: string;
  sessionToken?: string;
}
