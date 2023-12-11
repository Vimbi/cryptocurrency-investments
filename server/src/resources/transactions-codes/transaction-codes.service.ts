import { GoneException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, LessThan, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as moment from 'moment';
import { TransactionCode } from './entities/transaction-code.entity';

@Injectable()
export class TransactionCodesService {
  private _codeLifeSpan: number;
  private _codeDeletionCron: string;
  constructor(
    @InjectRepository(TransactionCode)
    private repository: Repository<TransactionCode>,
    private configService: ConfigService,
    private logger: Logger,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this._codeLifeSpan = this.configService.get('transaction.codeLifespan');
    this._codeDeletionCron = this.configService.get(
      'transaction.codeDeletionCron',
    );
  }

  /**
   * Validate transaction code
   * @param data data to validate
   * @return void
   * @throws GoneException
   */

  async validate({
    userId,
    code,
    manager,
  }: {
    userId: string;
    code: string;
    manager: EntityManager;
  }) {
    const result = await manager.findOneBy(TransactionCode, {
      code,
      userId,
      transactionId: IsNull(),
    });
    if (!result) {
      throw new GoneException(errorMsgs.transactionCodeInvalid);
    }
    const { createdAt } = result;
    if (moment(createdAt).add(this._codeLifeSpan, 'minutes').isBefore()) {
      throw new GoneException(errorMsgs.transactionCodeInvalid);
    }
  }

  /**
   * Removes unused expired codes
   */

  async _deleteExpiredTransactionCodes() {
    try {
      if (this._codeLifeSpan) {
        const transactionCodes = await this.repository.findBy({
          createdAt: LessThan(
            moment().subtract(this._codeLifeSpan, 'minutes').toDate(),
          ),
          transactionId: IsNull(),
        });
        if (transactionCodes?.length) {
          for (const { id } of transactionCodes) {
            try {
              await this.repository.delete({ id });
            } catch (error) {
              this.logger.error(
                `${errorMsgs.transactionCodeDeletionError}
                Id: ${id}
                Message: ${error.message}
                Stack trace: ${error.stack}`,
              );
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `${errorMsgs.transactionCodesDeletionError}
        Message: ${error.message}
        Stack trace: ${error.stack}`,
      );
    }
  }

  async onModuleInit() {
    if (this._codeDeletionCron) {
      const job = new CronJob(
        this._codeDeletionCron,
        async () => await this._deleteExpiredTransactionCodes(),
      );
      this.schedulerRegistry.addCronJob(
        `${this._deleteExpiredTransactionCodes.name}`,
        job,
      );
      job.start();
    }
  }
}
