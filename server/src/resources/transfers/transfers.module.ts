import { Logger, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { NetworksModule } from '../networks/networks.module';
import { TransferStatusesModule } from '../transfer-statuses/transfer-statuses.module';
import { TransactionTypesModule } from '../transaction-types/transaction-types.module';
import { IsValidRate } from '../../validation/is-valid-rate.validator';
import { UsersModule } from '../users/users.module';
import { TransferTypesModule } from '../transfer-types/transfer-types.module';
import { FixedCurrencyRatesModule } from '../fixed-currency-rates/fixed-currency-rates.module';
import { AccountStatementsModule } from '../account-statements/account-statements.module';
import { TransfersTasksService } from './transfers.tasks.service';
import { MailModule } from '../mail/mail.module';
import { TransferCodesModule } from '../transfers-codes/transfer-codes.module';
import { BullModule } from '@nestjs/bull';
import { BlockChainExplorerEnum } from './processors/block-chain-explorer.enum';
import { bullTransferScanOptionsService } from '../../utils/bull-queue-options/transfer-scan-options.service';
import { TransferInfoModule } from '../transfer-info/transfer-info.module';
import { TronscanModule } from '../tronscan/tronscan.module';
import { BscscanModule } from '../bscscan/bscscan.module';
import { BtcScanModule } from '../btc-scan/btc-scan.module';
import { BscscanTransferConsumer } from './processors/bsc-scan.processor';
import { BtsScanTransferConsumer } from './processors/btc-scan.processor';
import { EtherscanTransferConsumer } from './processors/ether-scan.processor';
import { TronscanTransferConsumer } from './processors/tron-scan.processor';
import { EtherScanModule } from '../ether-scan/ether-scan.module';

@Module({
  imports: [
    BscscanModule,
    BtcScanModule,
    BullModule.registerQueue(
      ...[
        bullTransferScanOptionsService(BlockChainExplorerEnum.bscscan),
        bullTransferScanOptionsService(BlockChainExplorerEnum.btcscan),
        bullTransferScanOptionsService(BlockChainExplorerEnum.etherscan),
        bullTransferScanOptionsService(BlockChainExplorerEnum.tronscan),
      ],
    ),
    EtherScanModule,
    TypeOrmModule.forFeature([Transfer]),
    forwardRef(() => AccountStatementsModule),
    FixedCurrencyRatesModule,
    MailModule,
    NetworksModule,
    TransferCodesModule,
    TransferInfoModule,
    TransactionTypesModule,
    TransferTypesModule,
    TransferStatusesModule,
    TronscanModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [TransfersController],
  providers: [
    TransfersService,
    TransfersTasksService,
    Logger,
    IsValidRate,
    BscscanTransferConsumer,
    BtsScanTransferConsumer,
    EtherscanTransferConsumer,
    TronscanTransferConsumer,
  ],
  exports: [TransfersService],
})
export class TransfersModule {}
