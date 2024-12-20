import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemDto {
  @ApiProperty({ description: 'ID of the cart', required: true })
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @ApiProperty({ description: 'ID of the product', required: true })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
