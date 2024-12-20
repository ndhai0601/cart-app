// cart.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { AddProductDto } from './dto/product.dto';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class ProductService {
  private readonly redisClient: Redis;

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = this.redisService.getOrNil(
      this.configService.get('REDIS_CONNECTION'),
    );
  }

  async addProduct(productDto: AddProductDto): Promise<Product> {
    const { name, price, sku } = productDto;

    // Kiểm tra nếu sản phẩm với SKU đã tồn tại
    const productExists = await this.productModel.exists({ sku });
    if (productExists) {
      throw new ConflictException(`Product with SKU ${sku} already exists`);
    }

    const newProduct = new this.productModel({ name, price, sku });
    return newProduct.save();
  }

  async getProductDetails(
    productIds: string[],
  ): Promise<Array<Omit<Product, 'save'> | null>> {
    if (productIds?.length <= 0) {
      return [];
    }

    // Retrieve multiple products from Redis using hmget
    const cachedProducts = await this.redisClient.hmget(
      'products', // Hash key for storing products
      ...productIds, // Spread the productIds array to get fields from the hash
    );

    // Identify the SKUs that were not found in Redis cache
    const missingProductIds = productIds.filter(
      (productId, index) => !cachedProducts[index],
    );

    // Fetch products from MongoDB only for the missing SKUs
    const productsFromDb = missingProductIds.length
      ? await this.productModel
          .find({ sku: { $in: missingProductIds } })
          .lean()
          .exec()
      : [];

    // Map products from Redis and MongoDB
    const products = await Promise.all(
      productIds.map(async (productId, index) => {
        const cachedProduct = cachedProducts[index];
        if (cachedProduct) {
          // If product exists in Redis cache, return it as an object
          return JSON.parse(cachedProduct);
        } else {
          // Find the product from MongoDB
          const productDocument = productsFromDb.find(
            (product) => product.sku === productId,
          );

          if (!productDocument) {
            throw new NotFoundException(
              `Product with SKU ${productId} does not exist`,
            );
          }

          // Convert the document to an object and save to Redis
          const product = productDocument;
          await this.redisClient.hset(
            'products', // Hash key for storing products
            productId, // SKU of the product
            JSON.stringify(product), // JSON-encoded product details
          );

          return product;
        }
      }),
    );

    return products;
  }
}
