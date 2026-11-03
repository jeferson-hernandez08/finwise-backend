import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password_hash: string;

  @Prop({ unique: true, sparse: true })
  google_id: string;

  @Prop()
  full_name: string;

  // Referencia a la colección 'Role'
  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role_id: Types.ObjectId;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);