import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Expense extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ExpenseCategory', required: true })
  category_id: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Debt', default: null })
  debt_id: Types.ObjectId | null;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ user_id: 1, date: -1 });