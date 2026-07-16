import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class SavingsGoal extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  target_amount: number;

  @Prop({ default: 0, min: 0 })
  current_amount: number;

  @Prop()
  deadline: Date;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const SavingsGoalSchema = SchemaFactory.createForClass(SavingsGoal);
SavingsGoalSchema.index({ user_id: 1 });