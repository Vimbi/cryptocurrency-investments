import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferTypeLocaleContent } from './entities/transfer-type-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransferTypeLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class TransferTypesLocaleContentModule {}
