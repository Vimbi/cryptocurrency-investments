import { OnQueueError, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { TransfersService } from '../transfers.service';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { errorMsgs } from '../../../shared/error-messages';
import { NetworkTokenTypeEnum } from '../../networks/network-token-type.enum';
import { transferNotes } from '../../../shared/messages';
import { TransactionTypesService } from '../../transaction-types/transaction-types.service';
import { TransactionTypeEnum } from '../../transaction-types/transaction-type.enum';
import { BlockChainExplorerEnum } from './block-chain-explorer.enum';
import { TransferInfoService } from '../../transfer-info/transfer-info.service';
import { BscscanService } from '../../bscscan/bscscan.service';
import { IBscTransactionInfo } from '../../../types/bscscan/bsc-transaction-info.interface';
import { ConfigService } from '@nestjs/config';
import { depositTransferProcessingInQueueForScanning } from '../../../utils/transfers/deposit-transfer-processing-in-queue-for-scanning';
import { ITransferScanBsc } from '../../../types/transfers/transfer-scan.interfaces';

@Processor(BlockChainExplorerEnum.bscscan)
export class BscscanTransferConsumer {
  private _minConfirmationsLimit: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
    private readonly transactionTypesService: TransactionTypesService,
    private readonly transferInfoService: TransferInfoService,
    private readonly transfersService: TransfersService,
    private readonly bscScanService: BscscanService,
  ) {
    this._minConfirmationsLimit = this.configService.get(
      'bscscan.minConfirmationsLimit',
    );
  }

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
        networkTokenType: NetworkTokenTypeEnum.bep20,
        transfersService: this.transfersService,
        scan: this._scan,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.queueError(BlockChainExplorerEnum.bscscan)}
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
   * Searching for a transaction and processing the results
   * @param data
   * @returns void
   */

  private async _scan({
    txId,
    depositAddress,
    currencyAmount,
    manager,
    transferId,
    amount,
    userId,
    fromAddress,
  }: ITransferScanBsc) {
    const scanResult = await this.bscScanService.getTransaction({
      hash: txId,
      address: depositAddress,
    });
    const notes = this._scanResultValidation({
      scanResult,
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
      if (
        scanResult.txreceipt_status === '1' &&
        parseInt(scanResult.confirmations, 10) >= this._minConfirmationsLimit
      ) {
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

  /**
   * Validates scan results
   * @param data data to validate
   * @return notes
   */

  private _scanResultValidation({
    scanResult,
    currencyAmount,
    fromAddress,
  }: {
    scanResult: IBscTransactionInfo;
    currencyAmount: number;
    fromAddress: string;
  }) {
    const notes = [];

    if (scanResult) {
      const { value, isError, from } = scanResult;

      const transactionAmount = parseInt(value, 10) / Math.pow(10, 18); // convert string to number
      if (transactionAmount < currencyAmount) {
        notes.push(transferNotes.amountNotMatch);
      }
      if (from !== fromAddress) {
        notes.push(transferNotes.fromAddressNotMatch);
      }
      if (isError === '1') {
        notes.push(transferNotes.canceled);
      }
    } else {
      notes.push(transferNotes.transactionNotFound);
    }
    return notes;
  }

  /**
   * Validation of the transfer for compliance with the queue
   * @param data data for validation
   * @returns void
   */

  // private _transferValidationInScanQueue({
  //   typeName,
  //   networkTokenType,
  //   txId,
  // }: ITransferValidationInScanQueue) {
  //   if (typeName !== TransferTypeEnum.deposit) {
  //     throw new InternalServerErrorException(errorMsgs.transferMustBeDeposit);
  //   }
  //   if (networkTokenType !== NetworkTokenTypeEnum.bep20) {
  //     throw new InternalServerErrorException(
  //       errorMsgs.transferTokenTypeInvalid,
  //     );
  //   }
  //   if (!txId) {
  //     throw new InternalServerErrorException(errorMsgs.transferHasNoTxId);
  //   }
  // }

  @OnQueueError()
  async handleError(job: Job) {
    this.logger.error(`Queue ${BlockChainExplorerEnum.bscscan} ERROR.
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
