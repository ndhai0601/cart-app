// schemas/cart.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Cart extends Document {
  @Prop({ type: [{ productId: String, quantity: Number }] })
  items: { productId: string; quantity: number }[];

  @Prop({ default: 0 })
  total: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
