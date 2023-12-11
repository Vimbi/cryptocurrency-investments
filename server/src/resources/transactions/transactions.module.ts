import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionSubscriber } from './transactions.subscriber';
import { TransfersModule } from '../transfers/transfers.module';
import { UsersModule } from '../users/users.module';
import { AccountStatementsModule } from '../account-statements/account-statements.module';
import { TransactionCodesModule } from '../transactions-codes/transaction-codes.module';
import { MailModule } from '../mail/mail.module';
import { TransactionTypesModule } from '../transaction-types/transaction-types.module';
import { TransactionsAdminController } from './controllers/transactions.admin.controller';
import { InvestmentsTransactionsModule } from '../investments-transactions/investments-transactions.module';
import { InvestmentsModule } from '../investments/investments.module';
import { BullModule } from '@nestjs/bull';
import { TelegramQueueNameEnum } from '../telegram-bot/telegram-queue-name.enum';
import { bullTelegramSendMessageOptionsService } from '../../utils/bull-queue-options/telegram-send-message-options.service';

@Module({
  imports: [
    forwardRef(() => AccountStatementsModule),
    forwardRef(() => InvestmentsModule),
    InvestmentsTransactionsModule,
    MailModule,
    BullModule.registerQueue(
      bullTelegramSendMessageOptionsService(TelegramQueueNameEnum.sendMessage),
    ),
    TypeOrmModule.forFeature([Transaction]),
    TransactionCodesModule,
    TransactionTypesModule,
    forwardRef(() => TransfersModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [TransactionsController, TransactionsAdminController],
  providers: [TransactionsService, TransactionSubscriber, Logger],
  exports: [TransactionsService],
})
export class TransactionsModule {}
