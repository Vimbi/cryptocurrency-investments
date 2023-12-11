import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Investment } from './entities/investment.entity';
import { InvestmentsController } from './investments.controller';
import { ReferralLevelsModule } from '../referral-levels/referral-levels.module';
import { InvestmentsService } from './investments.service';
import { AccountStatementsModule } from '../account-statements/account-statements.module';
import { InvestmentsTasksService } from './investments.tasks.service';
import { InvestmentsTransactionsModule } from '../investments-transactions/investments-transactions.module';
import { ProductEarningsSettingsModule } from '../product-earnings-settings/product-earnings-settings.module';
import { ProductsModule } from '../products/products.module';
import { TransactionTypesModule } from '../transaction-types/transaction-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Investment]),
    forwardRef(() => AccountStatementsModule),
    InvestmentsTransactionsModule,
    ProductEarningsSettingsModule,
    ProductsModule,
    ReferralLevelsModule,
    TransactionTypesModule,
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService, InvestmentsTasksService, Logger],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
