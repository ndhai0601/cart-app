// cart.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { PromotionService } from './promotion.service';
import { Product } from '../product/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private promotionService: PromotionService,
  ) {}

  async createCart(): Promise<Cart> {
    const newCart = new this.cartModel({ items: [], total: 0 });
    return newCart.save();
  }

  async addItemToCart(addItemDto: any) {
    const { cartId, productId, quantity } = addItemDto;
    const cart = await this.cartModel.findById(cartId).exec();
    if (!cart) {
      throw new NotFoundException('Cart does not exist');
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const productExists = await this.productModel.exists({ sku: productId });
    if (!productExists) {
      throw new NotFoundException('Product does not exist');
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    return cart.save();
  }

  async getCart(cartId: string) {
    return this.cartModel.findById(cartId).populate('items.productId').exec();
  }

  async applyPromotion(cartId: string, promotionCode: string) {
    const cart = await this.cartModel.findById(cartId).exec();
    if (!cart) {
      throw new Error('Cart not found');
    }

    const promotion =
      await this.promotionService.validatePromotion(promotionCode);
    if (!promotion) {
      throw new Error('Invalid promotion code');
    }

    let total = 0;
    for (const item of cart.items) {
      const product = await this.productModel.findById(item.productId).exec();
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      const discount = promotion.products.includes(item.productId)
        ? item.quantity * product.price * promotion.discount
        : 0;
      total += item.quantity * product.price - discount;
    }

    cart.total = total;
    return cart.save();
  }
}
