// promotion.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion } from './schemas/promotion.schema';

@Injectable()
export class PromotionService {
  constructor(
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
  ) {}

  async validatePromotion(code: string) {
    return this.promotionModel.findOne({ code, isActive: true }).exec();
  }
}
