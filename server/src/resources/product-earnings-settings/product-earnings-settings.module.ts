import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEarningsSetting } from './entities/product-earnings-setting.entity';
import { ProductEarningsSettingsController } from './product-earnings-settings.controller';
import { ProductEarningsSettingsService } from './product-earnings-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEarningsSetting])],
  controllers: [ProductEarningsSettingsController],
  providers: [ProductEarningsSettingsService],
  exports: [ProductEarningsSettingsService],
})
export class ProductEarningsSettingsModule {}
