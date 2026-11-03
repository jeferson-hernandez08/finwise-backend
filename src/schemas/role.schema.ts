import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string; // Ej: 'admin', 'user', 'auditor'

  @Prop()
  description: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);