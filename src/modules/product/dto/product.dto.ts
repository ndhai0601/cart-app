import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class AddProductDto {
  @ApiProperty({ description: 'ID of the cart', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ description: 'ID of the cart', required: true })
  @IsNumber()
  price: number;
  @ApiProperty({ description: 'ID of the cart', required: true })
  @IsString()
  @IsNotEmpty()
  sku: string;
}
