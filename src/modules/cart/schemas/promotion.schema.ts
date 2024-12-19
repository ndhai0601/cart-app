// schemas/promotion.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Promotion extends Document {
  @Prop()
  code: string;

  @Prop()
  discount: number;

  @Prop({ type: [String] })
  products: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
