import * as moment from 'moment';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOneOptions,
  FindOptionsWhere,
  LessThan,
  Repository,
} from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { FixedCurrencyRate } from './entities/fixed-currency-rate.entity';
import { CreateFixedCurrencyRateDto } from './dto/create-fixed-currency-rate.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MAX_DECIMAL_PLACES_CURRENCY } from '../../utils/constants/common-constants';
import { NetworksService } from '../networks/networks.service';

@Injectable()
export class FixedCurrencyRatesService {
  private _cronDeleteExpired: string;
  private _lifeSpan: number;
  constructor(
    @InjectRepository(FixedCurrencyRate)
    private repository: Repository<FixedCurrencyRate>,
    private readonly currenciesService: CurrenciesService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
    private readonly networksService: NetworksService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this._cronDeleteExpired = this.configService.get(
      'fixedCurrencyRate.cronDeleteExpired',
    );
    this._lifeSpan = this.configService.get('fixedCurrencyRate.lifeSpan');
  }

  /**
   * Create new FixedCurrencyRate
   * @param dto data to create FixedCurrencyRate
   * @returns created FixedCurrencyRate
   */

  async create({ networkId }: CreateFixedCurrencyRateDto) {
    const { currencyId } = await this.networksService.findOneOrFail({
      id: networkId,
    });
    const { rate } = await this.currenciesService.findOneWithRate(currencyId);
    const createdAt = new Date();
    const endedAt = moment(createdAt).add(this._lifeSpan, 'seconds').toDate();
    const insertResult = await this.repository.insert({
      networkId,
      rate: Number(rate.toFixed(MAX_DECIMAL_PLACES_CURRENCY)),
      createdAt,
      endedAt,
    });
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns FixedCurrencyRate by find options
   * @param findOptions find options
   * @return FixedCurrencyRate or undefined
   */

  async findOneBy(
    findOptions:
      | FindOptionsWhere<FixedCurrencyRate>
      | FindOptionsWhere<FixedCurrencyRate>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns FixedCurrencyRate by find options or throw error
   * @param findOptions find options
   * @returns FixedCurrencyRate
   * @throws NotFoundException if FixedCurrencyRate not found
   */

  async findOneOrFail(findOptions: FindOneOptions<FixedCurrencyRate>) {
    const result = await this.repository.findOne(findOptions);
    if (!result) {
      throw new NotFoundException(errorMsgs.networkNotFound);
    }
    return result;
  }

  /**
   * Validate FixedCurrencyRate by find options or throw error
   * @param findOptions find options
   * @returns FixedCurrencyRate
   * @throws error if FixedCurrencyRate not valid
   */

  async isValid(
    findOptions:
      | FindOptionsWhere<FixedCurrencyRate>
      | FindOptionsWhere<FixedCurrencyRate>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) {
      throw new NotFoundException(errorMsgs.networkNotFound);
    }
    if (
      moment().subtract(this._lifeSpan, 'seconds').isAfter(result.createdAt)
    ) {
      throw new BadRequestException(errorMsgs.fixedCurrencyRateExpired);
    }
    return true;
  }

  /**
   * Removes FixedCurrencyRate
   * @param findOptions find options
   * @returns void
   * @throws NotFoundException if FixedCurrencyRate not found
   */

  async delete(findOptions: FindOneOptions<FixedCurrencyRate>) {
    const { id } = await this.findOneOrFail(findOptions);
    await this.repository.delete({ id });
  }

  /**
   * Delete expired fixed currency rates
   */

  private async deleteExpired() {
    try {
      await this.repository.delete({
        createdAt: LessThan(
          moment().subtract(this._lifeSpan, 'seconds').toDate(),
        ),
      });
    } catch (error) {
      this.logger.error(`${errorMsgs.deleteFixedCurrencyRateExpiredError}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  async onModuleInit() {
    if (this._cronDeleteExpired) {
      const job = new CronJob(
        this._cronDeleteExpired,
        async () => await this.deleteExpired(),
      );
      this.schedulerRegistry.addCronJob(`${this.deleteExpired.name}`, job);
      job.start();
    }
  }
}
