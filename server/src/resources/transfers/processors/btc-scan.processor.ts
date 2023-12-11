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
import { BtcScanService } from '../../btc-scan/btc-scan.service';
import { IGetBtcTransactionsResponse } from '../../../types/bts-scan/get-btc-transactions-response.interface';
import { depositTransferProcessingInQueueForScanning } from '../../../utils/transfers/deposit-transfer-processing-in-queue-for-scanning';
import { ITransferScanBtc } from '../../../types/transfers/transfer-scan.interfaces';

@Processor(BlockChainExplorerEnum.btcscan)
export class BtsScanTransferConsumer {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
    private readonly transactionTypesService: TransactionTypesService,
    private readonly transferInfoService: TransferInfoService,
    private readonly transfersService: TransfersService,
    private readonly btcScanService: BtcScanService,
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
        networkTokenType: NetworkTokenTypeEnum.bitcoin,
        transfersService: this.transfersService,
        scan: this._scan,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.queueError(BlockChainExplorerEnum.btcscan)}
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
    currencyAmount,
    depositAddress,
    manager,
    transferId,
    amount,
    userId,
  }: ITransferScanBtc) {
    const scanResult = await this.btcScanService.getTransaction({
      hash: txId,
    });
    const { notes, status } = this._scanResultValidation({
      scanResult,
      currencyAmount,
      depositAddress,
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
      if (status) {
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
    depositAddress,
  }: {
    scanResult: IGetBtcTransactionsResponse;
    currencyAmount: number;
    depositAddress: string;
  }) {
    const notes = [];
    let confirmStatus: boolean;

    if (scanResult) {
      const { vout, status } = scanResult;
      confirmStatus = status.confirmed;

      const transactionToDepositAddress = vout.find(
        (transaction) => transaction.scriptpubkey_address === depositAddress,
      );
      if (transactionToDepositAddress) {
        const { value } = transactionToDepositAddress;
        const transactionAmount = value / 100000000; // convert to number
        if (transactionAmount < currencyAmount) {
          notes.push(transferNotes.amountNotMatch);
        }
      } else {
        notes.push(transferNotes.transactionNotFound);
      }
    } else {
      notes.push(transferNotes.transactionNotFound);
    }
    return { notes, status: confirmStatus };
  }

  @OnQueueError()
  async handleError(job: Job) {
    this.logger.error(`Queue ${BlockChainExplorerEnum.btcscan} ERROR.
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
