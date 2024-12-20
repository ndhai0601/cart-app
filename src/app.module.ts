import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './modules/cart/cart.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MongooseConfigService } from './config/mongoose.config';
import { RedisConfigService } from './config/redis.config';
import 'dotenv/config';
import { APP_PIPE } from '@nestjs/core';
import { ProductModule } from './modules/product/product.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CartModule,

    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),

    ProductModule,
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,

    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: false,
        skipMissingProperties: false,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
