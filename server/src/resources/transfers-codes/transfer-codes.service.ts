import { GoneException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, LessThan, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { TransferCode } from './entities/transfer-code.entity';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class TransferCodesService {
  private _codeLifeSpan: number;
  private _codeDeletionCron: string;
  constructor(
    @InjectRepository(TransferCode)
    private repository: Repository<TransferCode>,
    private configService: ConfigService,
    private logger: Logger,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this._codeLifeSpan = this.configService.get('transfer.codeLifespan');
    this._codeDeletionCron = this.configService.get(
      'transfer.codeDeletionCron',
    );
  }

  /**
   * Validate transfer code
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
    const result = await manager.findOneBy(TransferCode, {
      code,
      userId,
      transferId: IsNull(),
    });
    if (!result) {
      throw new GoneException(errorMsgs.transferCodeInvalid);
    }
    const { createdAt } = result;
    if (moment(createdAt).add(this._codeLifeSpan, 'minutes').isBefore()) {
      throw new GoneException(errorMsgs.transferCodeInvalid);
    }
  }

  /**
   * Removes unused expired codes
   */

  async _deleteExpired() {
    try {
      if (this._codeLifeSpan) {
        const transferCodes = await this.repository.findBy({
          createdAt: LessThan(
            moment().subtract(this._codeLifeSpan, 'minutes').toDate(),
          ),
          transferId: IsNull(),
        });
        if (transferCodes?.length) {
          for (const { id } of transferCodes) {
            try {
              await this.repository.delete({ id });
            } catch (error) {
              this.logger.error(
                `${errorMsgs.transferCodeDeletionError}
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
        `${errorMsgs.transferCodesDeletionError}
        Message: ${error.message}
        Stack trace: ${error.stack}`,
      );
    }
  }

  async onModuleInit() {
    if (this._codeDeletionCron) {
      const job = new CronJob(
        this._codeDeletionCron,
        async () => await this._deleteExpired(),
      );
      this.schedulerRegistry.addCronJob(`${this._deleteExpired.name}`, job);
      job.start();
    }
  }
}
