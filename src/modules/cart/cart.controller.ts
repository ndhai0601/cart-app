import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addItemToCart(@Body() addItemDto: AddItemDto) {
    return this.cartService.addItemToCart(addItemDto);
  }

  @Post('create')
  async createCart() {
    return this.cartService.createCart();
  }

  @Get(':id')
  async getCart(@Param('id') cartId: string) {
    return this.cartService.getCart(cartId);
  }

  // @Patch(':id/apply-promotion')
  // async applyPromotion(
  //   @Param('id') cartId: string,
  //   @Body('code') promotionCode: string,
  // ) {
  //   return this.cartService.applyPromotion(cartId, promotionCode);
  // }
}
