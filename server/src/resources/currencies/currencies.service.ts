import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { errorMsgs } from '../../shared/error-messages';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { BinanceService } from '../binance/binance.service';
import { CurrenciesSymbolsEnum } from './currencies-symbols.enum';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currency)
    private repository: Repository<Currency>,
    private binanceService: BinanceService,
    private logger: Logger,
  ) {}

  /**
   * Create new Currency
   * @param dto data to create Currency
   * @returns created Currency
   */

  async create(dto: CreateCurrencyDto) {
    const insertResult = await this.repository.insert(dto);
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns Currencies
   * @param findOptions find options
   * @returns array of Currencies
   */

  async find() {
    return await this.repository.find();
  }

  /**
   * Returns Currencies with rates
   * @param findOptions find options
   * @returns array of Currencies
   */

  async findWithRates() {
    const currencies = await this.repository.find();
    for (const currency of currencies) {
      try {
        currency.rate = await this.binanceService.getRate(currency.symbol);
      } catch (error) {
        this.logger.error(`${errorMsgs.currencyRateError}
          Message: ${error.message}
          Stack: ${error.stack}`);
      }
    }
    return currencies;
  }

  /**
   * Returns Currency with rate
   * @param id currency rate
   * @returns currency with rate
   */

  async findOneWithRate(id: string) {
    const currency = await this.findOneOrFail({
      where: { id },
    });
    if (currency.symbol === CurrenciesSymbolsEnum.USDT) {
      currency.rate = 1;
    } else {
      const rate = await this.binanceService.getRate(currency.symbol);
      if (rate > 0) {
        currency.rate = rate;
      } else {
        throw new NotFoundException(errorMsgs.currencyRateError);
      }
    }

    return currency;
  }

  /**
   * Returns Currency by find options
   * @param findOptions find options
   * @return Currency or undefined
   */

  async findOneBy(
    findOptions: FindOptionsWhere<Currency> | FindOptionsWhere<Currency>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns Currency by find options or throw error
   * @param findOptions find options
   * @returns Currency
   * @throws NotFoundException if Currency not found
   */

  async findOneOrFail(findOptions: FindOneOptions<Currency>) {
    const result = await this.repository.findOne(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.currencyNotFound);
    return result;
  }

  /**
   * Updates Currency
   * @param findOptions find options
   * @param dto data to update Currency
   * @returns updated Currency
   * @throws NotFoundException if Currency not found
   */

  async update(
    findOptions: FindOptionsWhere<Currency>,
    dto: UpdateCurrencyDto,
  ) {
    await this.findOneOrFail({ where: findOptions });
    await this.repository.update(findOptions, {
      ...dto,
      updatedAt: new Date(),
    });
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Removes Currency
   * @param findOptions find options
   * @returns void
   * @throws NotFoundException if Currency not found
   */

  async delete(findOptions: FindOptionsWhere<Currency>) {
    const { networks } = await this.findOneOrFail({
      where: findOptions,
      relations: {
        networks: true,
      },
    });
    if (networks.length) {
      throw new ConflictException(errorMsgs.currencyHasRelations);
    }
    await this.repository.delete(findOptions);
  }
}
