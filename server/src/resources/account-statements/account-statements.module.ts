import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountStatement } from './entities/account-statement.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccountStatementsService } from './account-statements.service';
import { AccountStatementsController } from './account-statement.controller';
import { UsersModule } from '../users/users.module';
import { InvestmentsModule } from '../investments/investments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountStatement]),
    forwardRef(() => InvestmentsModule),
    forwardRef(() => TransactionsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [AccountStatementsController],
  providers: [AccountStatementsService, Logger],
  exports: [AccountStatementsService],
})
export class AccountStatementsModule {}
