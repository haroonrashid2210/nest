import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Account } from './account.model';

export type HistoryDocument = History & Document;

@Schema({ timestamps: true })
export class History {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Accounts' })
  account1Id: Account;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Accounts' })
  account2Id: Account;

  @Prop()
  amount: number;

  // 1: Deposit, 2: Withdraw, 3: Transfered, 4: Received
  @Prop({ enum: [1, 2, 3, 4] })
  type: number;
}

export const HistorySchema = SchemaFactory.createForClass(History);

export interface HistoryInterface {
  account1Id: ObjectId;
  account2Id: ObjectId;
  amount: number;
  type: number;
}
