import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { DeepPartial } from '../../types/deep-partial.type';
import { Forgot } from './entities/forgot.entity';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { hoursToMilliseconds } from '../../utils/cast.helper';

@Injectable()
export class ForgotService {
  constructor(
    @InjectRepository(Forgot)
    private forgotRepository: Repository<Forgot>,
    private configService: ConfigService,
    private logger: Logger,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Returns Forgot by conditions
   * @param fields object where keys are search columns, values are search column values
   * @return Forgot or undefined
   */

  async findOneBy(
    fields: FindOptionsWhere<Forgot> | FindOptionsWhere<Forgot>[],
  ) {
    return this.forgotRepository.findOneBy(fields);
  }

  /**
   * Create new Forgot
   * @param data data to create Forgot
   * @returns insert result
   */

  async create(data: DeepPartial<Forgot>) {
    return this.forgotRepository.insert(this.forgotRepository.create(data));
  }

  /**
   * Soft delete Forgot by id
   * @param id Forgot id
   * @returns void
   */

  async softDelete(id: string): Promise<void> {
    await this.forgotRepository.softDelete(id);
  }

  /**
   * Removes expired hashes of forgotten passwords
   */

  async _deleteExpiredForgot() {
    try {
      const lifeSpan = hoursToMilliseconds(
        this.configService.get('forgot.lifespan'),
      );
      if (lifeSpan) {
        const forgots = await this.forgotRepository.findBy({
          createdAt: LessThan(new Date(Date.now() - lifeSpan)),
        });
        if (forgots.length > 0) {
          for (const forgot of forgots) {
            try {
              await this.forgotRepository.softDelete({ id: forgot.id });
            } catch (error) {
              this.logger.error(
                `${errorMsgs.forgotDeletionError}
                Id: ${forgot.id}
                Message: ${error.message}
                Stack trace: ${error.stack}`,
              );
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `${errorMsgs.forgotsDeletionError}
        Message: ${error.message}
        Stack trace: ${error.stack}`,
      );
    }
  }

  async onModuleInit() {
    if (this.configService.get('forgot.cronForgotDeletion')) {
      const job = new CronJob(
        this.configService.get('forgot.cronForgotDeletion'),
        async () => await this._deleteExpiredForgot(),
      );
      this.schedulerRegistry.addCronJob(
        `${this._deleteExpiredForgot.name}`,
        job,
      );
      job.start();
    }
  }

  /**
   * Delete forgots by conditions
   * @param fields object where keys are search columns, values are search column values
   * @return void
   */

  async delete(fields: FindOptionsWhere<Forgot>) {
    await this.forgotRepository.delete(fields);
  }
}
