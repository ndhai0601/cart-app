import { IsString, IsNotEmpty } from 'class-validator';

export class ApplyPromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
