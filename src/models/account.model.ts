import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { User } from './user.model';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ required: true, unique: true, uppercase: true })
  accountNumber: string;

  @Prop({ default: 0 })
  balance: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

export interface AccountInterface {
  _id: ObjectId;
  userId: string;
  accountNumber: string;
  balance: number;
}
