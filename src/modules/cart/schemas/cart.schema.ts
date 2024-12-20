import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Cart extends Document {
  @Prop({ default: uuidv4 }) // Sử dụng UUID thay cho ObjectId mặc định
  _id: string;

  @Prop({ type: [{ productId: String, quantity: Number }] })
  items: { productId: string; quantity: number }[];

  @Prop({ default: 0 })
  total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
