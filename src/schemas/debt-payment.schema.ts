import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class DebtPayment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Debt', required: true })
  debt_id: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  payment_date: Date;
}

export const DebtPaymentSchema = SchemaFactory.createForClass(DebtPayment);