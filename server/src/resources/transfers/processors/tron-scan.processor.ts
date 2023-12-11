import { OnQueueError, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransfersService } from '../transfers.service';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { errorMsgs } from '../../../shared/error-messages';
import { TronscanService } from '../../tronscan/tronscan.service';
import { NetworkTokenTypeEnum } from '../../networks/network-token-type.enum';
import { transferNotes } from '../../../shared/messages';
import { TransactionTypesService } from '../../transaction-types/transaction-types.service';
import { TransactionTypeEnum } from '../../transaction-types/transaction-type.enum';
import { BlockChainExplorerEnum } from './block-chain-explorer.enum';
import { TransferInfoService } from '../../transfer-info/transfer-info.service';
import { ITronscanResultValidation } from '../../../types/tronscan/tron-scan-result-validation.interface';
import { depositTransferProcessingInQueueForScanning } from '../../../utils/transfers/deposit-transfer-processing-in-queue-for-scanning';
import { ITransferScanTron } from '../../../types/transfers/transfer-scan.interfaces';

@Processor(BlockChainExplorerEnum.tronscan)
export class TronscanTransferConsumer {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
    private readonly transactionTypesService: TransactionTypesService,
    private readonly transferInfoService: TransferInfoService,
    private readonly transfersService: TransfersService,
    private readonly tronScanService: TronscanService,
  ) {}

  @Process()
  async transferScan({ data }: Job<{ transferId: string }>) {
    const { transferId } = data;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const { manager } = queryRunner;

    try {
      await depositTransferProcessingInQueueForScanning({
        manager,
        transferId,
        networkTokenType: NetworkTokenTypeEnum.trc20,
        transfersService: this.transfersService,
        scan: this._scan,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.queueError(
        BlockChainExplorerEnum.tronscan,
      )}
        Message: ${error.message}
        Stack: ${error.stack}
        Data: ${JSON.stringify(error?.response?.data)}`);
      await this.transferInfoService.pushMessage({
        transferId,
        message: error.message,
      });
    } finally {
      await queryRunner.release();
    }

    return {};
  }

  /**
   * Validates scan results
   * @param data data to validate
   * @return notes
   */

  private _scanResultValidation({
    tokenTransferInfo,
    currencySymbol,
    depositAddress,
    networkTokenType,
    currencyAmount,
    fromAddress,
  }: ITronscanResultValidation) {
    const notes = [];

    if (tokenTransferInfo) {
      const { to_address, symbol, tokenType, amount_str, from_address } =
        tokenTransferInfo;

      if (symbol !== currencySymbol) {
        notes.push(transferNotes.currencyNotMatch);
      }

      if (to_address !== depositAddress) {
        notes.push(transferNotes.depositAddressNotMatch);
      }

      if (tokenType !== networkTokenType) {
        notes.push(transferNotes.tokenTypeNotMatch);
      }

      if (fromAddress !== from_address) {
        notes.push(transferNotes.fromAddressNotMatch);
      }

      const tokenTransferAmount = parseInt(amount_str, 10) / 1000000; // convert string to number
      if (tokenTransferAmount < currencyAmount) {
        notes.push(transferNotes.amountNotMatch);
      }
    } else {
      notes.push(transferNotes.transactionNotFound);
    }
    return notes;
  }

  /**
   * Searching for a transaction and processing the results
   * @param data
   * @returns void
   */

  private async _scan({
    txId,
    currencySymbol,
    depositAddress,
    tokenType,
    currencyAmount,
    manager,
    transferId,
    amount,
    userId,
    fromAddress,
  }: ITransferScanTron) {
    const scanResult = await this.tronScanService.getTransaction(txId);
    const { tokenTransferInfo, contractRet } = scanResult;
    const notes = this._scanResultValidation({
      tokenTransferInfo,
      currencySymbol,
      depositAddress,
      networkTokenType: tokenType,
      currencyAmount,
      fromAddress,
    });

    if (notes.length) {
      await this.transfersService.cancel({
        manager,
        id: transferId,
        note: notes.join(', '),
        txId,
        amount,
      });
    } else {
      if (contractRet === 'SUCCESS') {
        const transactionTypeDeposit =
          await this.transactionTypesService.findOneOrFail({
            name: TransactionTypeEnum.deposit,
          });

        await this.transfersService.completeTransferCreateTransaction({
          manager,
          id: transferId,
          userId,
          amount,
          typeId: transactionTypeDeposit.id,
          txId,
        });
      }
    }
  }

  @OnQueueError()
  async handleError(job: Job) {
    this.logger.error(`Queue ${BlockChainExplorerEnum.tronscan} ERROR.
    Reason: ${job.failedReason}
    Job data: ${JSON.stringify(job.data)}
    Stack trace: ${job.stacktrace}`);
  }

  @OnQueueFailed()
  async handleFail(job: Job) {
    this.logger.error(`Queue FAIL.
      Data: ${JSON.stringify(job.data)}
      Stack trace: ${job.stacktrace}`);
  }
}
