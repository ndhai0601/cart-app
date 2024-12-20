import { Body, Controller, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { AddProductDto } from './dto/product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('add-product')
  async addProduct(@Body() productDto: AddProductDto) {
    return this.productService.addProduct(productDto);
  }
}
