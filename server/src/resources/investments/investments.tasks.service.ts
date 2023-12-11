import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import {
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { Investment } from './entities/investment.entity';
import { ProductEarningsSettingsService } from '../product-earnings-settings/product-earnings-settings.service';
import { ProductsService } from '../products/products.service';
import { SortOrder } from '../../utils/sort-order.enum';
import { ProductEarningsSetting } from '../product-earnings-settings/entities/product-earnings-setting.entity';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';
import { TransactionTypeEnum } from '../transaction-types/transaction-type.enum';
import * as moment from 'moment';
import { InvestmentsService } from './investments.service';

@Injectable()
export class InvestmentsTasksService {
  _cronIncomeAccrual: string;
  _cronInvestmentsComplete: string;
  _timeZone: string;
  _investmentAmountSnapshotTime: number;
  constructor(
    @InjectRepository(Investment)
    private repository: Repository<Investment>,
    private readonly configService: ConfigService,
    private readonly investmentsService: InvestmentsService,
    private readonly productEarningsSettingsService: ProductEarningsSettingsService,
    private readonly logger: Logger,
    private readonly productsService: ProductsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly transactionTypesService: TransactionTypesService,
  ) {
    this._cronIncomeAccrual = this.configService.get(
      'investments.cronIncomeAccrual',
    );
    this._cronInvestmentsComplete = this.configService.get(
      'investments.cronInvestmentsComplete',
    );
    this._investmentAmountSnapshotTime = this.configService.get(
      'investments.investmentAmountSnapshotTime',
    );
    this._timeZone = this.configService.get('app.timeZone');
  }

  /**
   * Cron task for calculating investments income
   */

  private async _incomeAccrual() {
    try {
      const investments = await this.repository.find({
        where: {
          startDate: LessThanOrEqual(moment().startOf('day').toDate()),
          dueDate: MoreThanOrEqual(moment().startOf('day').toDate()),
          completedAt: IsNull(),
          canceledAt: IsNull(),
        },
        relations: { user: true },
      });

      if (investments.length) {
        const incomeTransactionType =
          await this.transactionTypesService.findOneOrFail({
            name: TransactionTypeEnum.income,
          });
        const withdrawalTransactionType =
          await this.transactionTypesService.findOneOrFail({
            name: TransactionTypeEnum.withdrawal,
          });

        const products = await this.productsService.findAll();

        const todayProductsEarningsSettings: ProductEarningsSetting[] = [];
        for (const product of products) {
          const todayProductEarningSetting =
            await this.productEarningsSettingsService.findOneOrFail({
              where: {
                productId: product.id,
                date: LessThanOrEqual(new Date()),
              },
              order: { date: SortOrder.DESC },
            });
          todayProductsEarningsSettings.push(todayProductEarningSetting);
        }

        const investmentAmountSnapshotDate = moment()
          .hour(this._investmentAmountSnapshotTime)
          .minute(0)
          .second(0)
          .toDate();

        for (const investment of investments) {
          await this.investmentsService.incomeAccrual({
            userId: investment.userId,
            investmentId: investment.id,
            investmentAmountSnapshotDate,
            todayProductsEarningsSettings,
            profitTransactionTypeId: incomeTransactionType.id,
            withdrawalTransactionTypeId: withdrawalTransactionType.id,
          });
        }
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.incomeAccrualCron}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  /**
   * Complete the investments and withdraw funds to the balance
   */

  private async _completeInvestments() {
    try {
      const investments = await this.repository.find({
        where: {
          startDate: LessThanOrEqual(moment().startOf('day').toDate()),
          dueDate: LessThan(moment().toDate()),
          completedAt: IsNull(),
          canceledAt: IsNull(),
        },
        relations: { user: true },
      });
      for (const investment of investments) {
        await this.investmentsService.completeInvestment({
          investmentId: investment.id,
          userId: investment.userId,
        });
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.investmentsCompleteCron}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  async onModuleInit() {
    if (this._cronIncomeAccrual) {
      const job = new CronJob(
        this._cronIncomeAccrual,
        async () => await this._incomeAccrual(),
        null,
        false,
        this._timeZone,
      );
      this.schedulerRegistry.addCronJob(`${this._incomeAccrual.name}`, job);
      job.start();
    }
    if (this._cronInvestmentsComplete) {
      const job = new CronJob(
        this._cronInvestmentsComplete,
        async () => await this._completeInvestments(),
        null,
        false,
        this._timeZone,
      );
      this.schedulerRegistry.addCronJob(
        `${this._completeInvestments.name}`,
        job,
      );
      job.start();
    }
  }
}
