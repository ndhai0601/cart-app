import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './modules/cart/cart.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MongooseConfigService } from './config/mongoose.config';
import { RedisConfigService } from './config/redis.config';
import 'dotenv/config';

@Module({
  imports: [
    CartModule,

    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    // RedisModule.forRootAsync({
    //   useClass: RedisConfigService,
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
