// cart.service.ts
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { AddProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

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
}
