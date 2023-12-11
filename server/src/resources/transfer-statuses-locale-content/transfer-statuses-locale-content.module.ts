import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferStatusLocaleContent } from './entities/transfer-statuses-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransferStatusLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class TransferStatusesLocaleContentModule {}
