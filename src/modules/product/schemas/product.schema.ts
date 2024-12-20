// schemas/product.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop({ unique: true })
  sku: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
