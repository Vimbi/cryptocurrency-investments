import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentsTransactionsService } from './investments-transactions.service';
import { InvestmentTransaction } from './entities/investment-transaction.entity';
import { InvestmentsTransactionsController } from './investments-transactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InvestmentTransaction])],
  controllers: [InvestmentsTransactionsController],
  providers: [InvestmentsTransactionsService],
  exports: [InvestmentsTransactionsService],
})
export class InvestmentsTransactionsModule {}
