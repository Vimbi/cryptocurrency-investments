import * as moment from 'moment';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOneOptions,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { AccountStatement } from './entities/account-statement.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { SortOrder } from '../../utils/sort-order.enum';
import { UsersService } from '../users/users.service';
import { errorMsgs } from '../../shared/error-messages';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { InvestmentsService } from '../investments/investments.service';
import { convertNumberToPercentage } from '../../utils/convert-number-to-percentage';
import { calculateInvestmentIncome } from '../../utils/investments/calculate-investment-income';
import { IGetBalanceResponse } from '../../types/account-statements/get-balance-response.interface';

@Injectable()
export class AccountStatementsService {
  private _timeZone: string;
  private readonly _cronClosingPeriod: string;
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AccountStatement)
    private repository: Repository<AccountStatement>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => InvestmentsService))
    private readonly investmentsService: InvestmentsService,
    private readonly logger: Logger,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    this._cronClosingPeriod = this.configService.get(
      'accountStatement.cronClosingPeriod',
    );
    this._timeZone = this.configService.get('app.timeZone');
  }

  /**
   * Returns AccountStatement
   * @param findOptions find options
   * @returns AccountStatement or undefined
   */

  async findOne(findOptions: FindOneOptions<AccountStatement>) {
    return await this.repository.findOne(findOptions);
  }

  /**
   * Get user balance
   * @param userId user id
   * @returns user balance in dollars
   */

  async getBalance(userId: string): Promise<IGetBalanceResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    const balance = await this.getBalanceTransactional({ userId, manager });
    await queryRunner.commitTransaction();
    await queryRunner.release();

    const investment = await this.investmentsService.findOne({
      where: { userId, completedAt: IsNull(), canceledAt: IsNull() },
      relations: { investmentTransactions: { type: true } },
    });
    const lastUpdateInfo = await this.investmentsService.getLastUpdateInfo(
      userId,
    );
    const income = convertCentsToDollars(
      investment?.investmentTransactions
        ? calculateInvestmentIncome(investment.investmentTransactions)
        : 0,
    );

    return {
      balance: convertCentsToDollars(balance),
      invested: convertCentsToDollars(investment?.amount || 0),
      income,
      investmentDueDate: investment?.dueDate || null,
      lastUpdateDate: lastUpdateInfo?.lastUpdateDate || null,
      lastIncomePercent: convertNumberToPercentage(
        lastUpdateInfo?.lastIncomePercent,
      ),
      productId: investment?.productId,
    };
  }

  /**
   * Get user balance. Transactional
   * @param userId user id
   * @returns user balance
   */

  async getBalanceTransactional({
    userId,
    manager,
  }: {
    userId: string;
    manager: EntityManager;
  }) {
    const accountStatement = await manager.findOne(AccountStatement, {
      where: { userId },
      order: { date: SortOrder.DESC },
    });

    const closingBalance = accountStatement?.closingBalance
      ? accountStatement.closingBalance
      : 0;

    const totalIncome = await this.transactionsService.getTotalIncome({
      userId,
      manager,
    });

    const totalConsumption = await this.transactionsService.getTotalConsumption(
      {
        userId,
        manager,
        isAccountStatement: false,
      },
    );
    return closingBalance + totalIncome - totalConsumption;
  }

  /**
   * Create account statement
   * @param userId user id
   */

  private async _create(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const { manager } = queryRunner;

    try {
      const totalIncome = await this.transactionsService.getTotalIncome({
        userId,
        afterDate: moment()
          .startOf('month')
          .subtract(1, 'month') // get last month
          .toDate(),
        beforeDate: moment().startOf('month').toDate(),
        manager,
      });
      const totalConsumption =
        await this.transactionsService.getTotalConsumption({
          userId,
          afterDate: moment()
            .startOf('month')
            .subtract(1, 'month') // get last month
            .toDate(),
          beforeDate: moment().startOf('month').toDate(),
          manager,
          isAccountStatement: true,
        });
      const previousAccountStatement = await this.repository.findOne({
        where: { date: Not(IsNull()), userId },
        order: { date: SortOrder.DESC },
      });
      const previousClosingBalance = previousAccountStatement?.closingBalance
        ? previousAccountStatement.closingBalance
        : 0;
      const closingBalance =
        previousClosingBalance + totalIncome - totalConsumption;

      await this.repository.insert({
        userId,
        date: moment().startOf('month').format(),
        closingBalance,
        totalIncome,
        totalConsumption,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.accountStatementCreation}
        User id: ${userId}
        Message: ${error.message}
        Stack: ${error.stack}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create account statements
   */

  async _createAccountStatements() {
    try {
      const users = await this.usersService.findAll();

      for (const user of users) {
        await this._create(user.id);
      }
    } catch (error) {
      this.logger.error(`${errorMsgs.accountStatementCreation}
        Message: ${error.message}
        Stack: ${error.stack}`);
    }
  }

  async onModuleInit() {
    if (this._cronClosingPeriod) {
      const job = new CronJob(
        this._cronClosingPeriod,
        async () => await this._createAccountStatements(),
        // null,
        // false,
        // this._timeZone,
      );
      this.schedulerRegistry.addCronJob(
        `${this._createAccountStatements.name}`,
        job,
      );
      job.start();
    }
  }
}
