import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Debt extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  total_amount: number;

  @Prop({ required: true, min: 0 })
  remaining_amount: number;

  @Prop()
  minimum_monthly_payment: number;

  @Prop()
  interest_rate: number;

  @Prop()
  due_date: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
DebtSchema.index({ user_id: 1 });