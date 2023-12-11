import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { Brackets, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { TransferStatusEnum } from '../transfer-statuses/transfer-status.enum';
import { TransferStatusesService } from '../transfer-statuses/transfer-statuses.service';
import { TransferTypesService } from '../transfer-types/transfer-types.service';
import { Transfer } from './entities/transfer.entity';
import { TransferTypeEnum } from './transfer-types.enum';
import * as moment from 'moment';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NetworkTokenTypeEnum } from '../networks/network-token-type.enum';
import { BlockChainExplorerEnum } from './processors/block-chain-explorer.enum';
import { TransferInfoService } from '../transfer-info/transfer-info.service';
import { TransfersService } from './transfers.service';

@Injectable()
export class TransfersTasksService {
  _cronCancelExpired: string;
  _transferProcessingMaxAttemptsLimit: number;
  _cronDepositTransfersProcessing: string;
  constructor(
    @InjectRepository(Transfer)
    private repository: Repository<Transfer>,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly transferInfoService: TransferInfoService,
    private readonly transfersService: TransfersService,
    private readonly transferStatusesService: TransferStatusesService,
    private readonly transferTypesService: TransferTypesService,
    @InjectQueue(BlockChainExplorerEnum.bscscan)
    private bscscanQueue: Queue,
    @InjectQueue(BlockChainExplorerEnum.btcscan)
    private btcscanQueue: Queue,
    @InjectQueue(BlockChainExplorerEnum.etherscan)
    private etherscanQueue: Queue,
    @InjectQueue(BlockChainExplorerEnum.tronscan)
    private tronscanQueue: Queue,
  ) {
    this._cronCancelExpired = this.configService.get(
      'transfer.cronDepositCancelExpired',
    );
    this._transferProcessingMaxAttemptsLimit = this.configService.getOrThrow(
      'transfer.processingMaxAttemptsLimit',
    );
    this._cronDepositTransfersProcessing = this.configService.get(
      'transfer.cronDepositTransfersProcessing',
    );
  }

  /**
   * Cancel of expired transfers
   */

  async _cancelExpiredTransfers() {
    try {
      const transferStatusCanceled =
        await this.transferStatusesService.findOneOrFail({
          name: TransferStatusEnum.canceled,
        });
      const transferStatusPending =
        await this.transferStatusesService.findOneOrFail({
          name: TransferStatusEnum.pending,
        });
      const transferTypeDeposit = await this.transferTypesService.findOneOrFail(
        {
          name: TransferTypeEnum.deposit,
        },
      );

      await this.repository
        .createQueryBuilder('transfer')
        .update()
        .set({ updatedAt: new Date(), statusId: transferStatusCanceled.id })
        .where('transfer."typeId" = :typeId', {
          typeId: transferTypeDeposit.id,
        })
        .andWhere('transfer."statusId" = :statusId', {
          statusId: transferStatusPending.id,
        })
        .andWhere('transfer."endedAt" < now()')
        .andWhere('transfer."txId" IS NULL')
        .execute();
    } catch (error) {
      this.logger.error(`${errorMsgs.transferCronCancelExpired}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  /**
   * Finds transfers awaiting processing and puts them in the appropriate queue
   */

  async _depositTransfersProcessing() {
    try {
      const statusProcessed = await this.transferStatusesService.findOneOrFail({
        name: TransferStatusEnum.processed,
      });
      const transfers = await this.repository
        .createQueryBuilder('transfer')
        .leftJoin('transfer.info', 'info')
        // .leftJoin('transfer.status', 'status')
        .leftJoin('transfer.duplicateStatus', 'status')
        .leftJoin('transfer.type', 'type')
        .leftJoin('transfer.transaction', 'transaction')
        .leftJoinAndSelect('transfer.network', 'network')
        .leftJoin('network.currency', 'currency')
        .where('status.name IN (:...statusNames)', {
          statusNames: [
            TransferStatusEnum.pending,
            TransferStatusEnum.processed,
          ],
        })
        .andWhere('type.name = :typeName', {
          typeName: TransferTypeEnum.deposit,
        })
        .andWhere('info.attempts < :maxAttempts', {
          maxAttempts: this._transferProcessingMaxAttemptsLimit,
        })
        .andWhere(
          new Brackets((qb) => {
            qb.where(
              new Brackets((qb1) => {
                qb1
                  .where('info.attempts = :first', {
                    first: 0,
                  })
                  .andWhere('transfer.updatedAt < :firstTime', {
                    firstTime: moment().subtract(5, 'minutes').toDate(),
                  });
              }),
            )
              .orWhere(
                new Brackets((qb2) => {
                  qb2
                    .where('info.attempts = :second', {
                      second: 1,
                    })
                    .andWhere('transfer.updatedAt < :secondTime', {
                      secondTime: moment().subtract(10, 'minutes').toDate(),
                    });
                }),
              )
              .orWhere(
                new Brackets((qb3) => {
                  qb3
                    .where('info.attempts = :third', {
                      third: 2,
                    })
                    .andWhere('transfer.updatedAt < :thirdTime', {
                      thirdTime: moment().subtract(15, 'minutes').toDate(),
                    });
                }),
              )
              .orWhere(
                new Brackets((qb4) => {
                  qb4
                    .where('info.attempts = :fourth', {
                      fourth: 3,
                    })
                    .andWhere('transfer.updatedAt < :fourthTime', {
                      fourthTime: moment().subtract(20, 'minutes').toDate(),
                    });
                }),
              )
              .orWhere(
                new Brackets((qb5) => {
                  qb5
                    .where('info.attempts = :fifth', {
                      fifth: 4,
                    })
                    .andWhere('transfer.updatedAt < :fifthTime', {
                      fifthTime: moment().subtract(25, 'minutes').toDate(),
                    });
                }),
              );
          }),
        )
        .andWhere('transaction.id IS NULL')
        .getMany();
      if (transfers.length) {
        for (const { id } of transfers) {
          await this.transfersService.systemUpdate({
            findOptions: { id },
            partialEntity: { statusId: statusProcessed.id },
          });
          await this.transferInfoService.incrementAttempts(id);
        }
        for (const { id, network } of transfers) {
          const { tokenType } = network;
          try {
            if (tokenType === NetworkTokenTypeEnum.bep20) {
              await this.bscscanQueue.add({ transferId: id });
            } else if (tokenType === NetworkTokenTypeEnum.bitcoin) {
              await this.btcscanQueue.add({ transferId: id });
            } else if (tokenType === NetworkTokenTypeEnum.erc20) {
              await this.etherscanQueue.add({ transferId: id });
            } else if (tokenType === NetworkTokenTypeEnum.trc20) {
              await this.tronscanQueue.add({ transferId: id });
            } else {
              await this.transferInfoService.update(
                { transferId: id },
                { attempts: this._transferProcessingMaxAttemptsLimit },
              );
              this.logger.error(`${errorMsgs.tokenTypeUnknown}
                Transfer id: ${id}
                Token type: ${tokenType}`);
            }
          } catch (error) {
            this.logger.error(`${errorMsgs.transferAddScanQueue}
              Transfer id: ${id}
              Message: ${error.message}
              Stack: ${error.stack}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.transfersDepositProcessing}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  async onModuleInit() {
    if (this._cronCancelExpired) {
      const job = new CronJob(
        this._cronCancelExpired,
        async () => await this._cancelExpiredTransfers(),
      );
      this.schedulerRegistry.addCronJob(
        `${this._cancelExpiredTransfers.name}`,
        job,
      );
      job.start();
    }

    if (this._cronDepositTransfersProcessing) {
      const job = new CronJob(
        this._cronDepositTransfersProcessing,
        async () => await this._depositTransfersProcessing(),
      );
      this.schedulerRegistry.addCronJob(
        `${this._depositTransfersProcessing.name}`,
        job,
      );
      job.start();
    }
  }
}
