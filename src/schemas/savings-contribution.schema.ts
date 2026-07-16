import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class SavingsContribution extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SavingsGoal', required: true })
  savings_goal_id: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop()
  note: string;
}

export const SavingsContributionSchema = SchemaFactory.createForClass(SavingsContribution);