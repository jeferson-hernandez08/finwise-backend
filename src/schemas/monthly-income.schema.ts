import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class MonthlyIncome extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ required: true })
  year: number;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const MonthlyIncomeSchema = SchemaFactory.createForClass(MonthlyIncome);
// Índice compuesto único: user_id + year + month
MonthlyIncomeSchema.index({ user_id: 1, year: 1, month: 1 }, { unique: true });