import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { PromotionService } from './promotion.service';
import { Product } from '../product/schemas/product.schema';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  private readonly redisClient: Redis;

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private promotionService: PromotionService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly productService: ProductService,
  ) {
    this.redisClient = this.redisService.getOrNil(
      this.configService.get('REDIS_CONNECTION'),
    );
  }

  async createCart(): Promise<Cart> {
    const newCart = new this.cartModel({ items: [], total: 0 });
    return newCart.save();
  }

  async addItemToCart(addItemDto: any) {
    const { cartId, productId, quantity } = addItemDto;

    // Lấy thông tin sản phẩm
    const products = await this.productService.getProductDetails([productId]);
    const product = products?.[0];

    // Lấy giỏ hàng từ Redis hoặc MongoDB
    const cachedCart = await this.redisClient.get(`cart:${cartId}`);
    let cart;

    if (cachedCart) {
      cart = JSON.parse(cachedCart);
    } else {
      cart = await this.cartModel.findById(cartId).lean().exec();
      if (!cart) {
        throw new NotFoundException('Cart does not exist');
      }
    }

    // Thêm hoặc cập nhật sản phẩm trong giỏ hàng
    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, productDetails: product });
    }

    // Tính lại tổng tiền
    cart.total = cart.items.reduce(
      (sum, item) =>
        sum +
        item.quantity * (item.productDetails ? item.productDetails.price : 0),
      0,
    );

    // Cập nhật Redis với giỏ hàng mới (bao gồm thông tin sản phẩm)
    await this.redisClient.set(
      `cart:${cartId}`,
      JSON.stringify(cart),
      'EX',
      3600,
    );

    // Đồng bộ MongoDB (chỉ khi cần)
    await this.cartModel
      .findByIdAndUpdate(cartId, { items: cart.items, total: cart.total })
      .lean()
      .exec();

    return cart;
  }
  async getCart(cartId: string) {
    // Lấy giỏ hàng từ Redis hoặc MongoDB
    const cachedCart = await this.redisClient.get(`cart:${cartId}`);
    let cart;

    if (cachedCart) {
      cart = JSON.parse(cachedCart);
    } else {
      cart = await this.cartModel.findById(cartId).lean().exec();
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
    }

    // Lấy thông tin sản phẩm cho tất cả productId trong giỏ hàng
    const productDetailsMap = await this.productService.getProductDetails(
      cart?.items?.map((item) => item.productId),
    );

    // Map thông tin sản phẩm cho mỗi item trong giỏ hàng
    const updatedItems = cart.items.map((item) => {
      const productDetails = productDetailsMap.find(
        (product) => product.sku === item.productId,
      );

      if (productDetails) {
        item.productDetails = productDetails;
      } else {
        throw new NotFoundException(
          `Product with SKU ${item.productId} not found`,
        );
      }
      return item;
    });

    // Cập nhật giỏ hàng với thông tin sản phẩm đầy đủ
    cart.items = updatedItems;

    // Lưu lại giỏ hàng vào Redis nếu cần
    await this.redisClient.set(
      `cart:${cartId}`,
      JSON.stringify(cart),
      'EX',
      3600, // Cache expiration time (e.g., 1 hour)
    );

    return cart;
  }

  async deleteCartSession(cartId: string): Promise<void> {
    await this.redisClient.del(`cart:${cartId}`);
  }
}
