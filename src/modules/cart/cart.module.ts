import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { Promotion, PromotionSchema } from './schemas/promotion.schema';
import { CartController } from './cart.controller';
import { PromotionService } from './promotion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Promotion.name, schema: PromotionSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, PromotionService],
})
export class CartModule {}
