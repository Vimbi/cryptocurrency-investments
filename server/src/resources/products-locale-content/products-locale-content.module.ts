import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLocaleContent } from './entities/product-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ProductsLocaleContentModule {}
