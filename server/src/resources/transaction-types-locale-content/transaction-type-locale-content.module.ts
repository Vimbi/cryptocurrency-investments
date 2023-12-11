import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionTypeLocaleContent } from './entities/transaction-type-locale-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionTypeLocaleContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class TransactionTypesLocaleContentModule {}
