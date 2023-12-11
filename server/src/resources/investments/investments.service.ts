import * as moment from 'moment';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOneOptions,
  FindOptionsWhere,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { Investment } from './entities/investment.entity';
import { ICreateInvestment } from '../../types/investments/create-investment.interface';
import { ConfigService } from '@nestjs/config';
import { TransactionType } from '../transaction-types/entities/transaction-type.entity';
import { TransactionTypeEnum } from '../transaction-types/transaction-type.enum';
import { defineInvestmentDates } from '../../utils/define-investment-dates';
import { AccountStatementsService } from '../account-statements/account-statements.service';
import { qbFindInvestments } from '../../utils/query-builders/find-investments';
import { IFindInvestments } from '../../types/investments/find-transfers.interface';
import { IValidateReplenishInvestment } from '../../types/investments/validate-replenish-investment.interface';
import { SortOrder } from '../../utils/sort-order.enum';
import { ReferralLevelsService } from '../referral-levels/referral-levels.service';
import { User } from '../users/entities/user.entity';
import { IValidateInvestmentCreation } from '../../types/investments/validate-investment-creation.interface';
import { IGiveInvestmentReferralReward } from '../../types/investments/give-investment-referral-reward.interface';
import { IReplenishInvestment } from '../../types/investments/replenish-investment.interface';
import { calculateInvestmentDepositsAmount } from '../../utils/investments/calculate-investment-deposits-amount';
import { createCancelationInvestmentTransactions } from '../../utils/investments/create-cancelation-investment-transactions';
import { createDepositInvestmentTransactions } from '../../utils/investments/create-deposit-investment-transactions';
import { InvestmentsTransactionsService } from '../investments-transactions/investments-transactions.service';
import { convertNumberToPercentage } from '../../utils/convert-number-to-percentage';
import { IInvestmentIncomeAccrual } from '../../types/investments/investment-income-accrual.interface';
import { InvestmentTransaction } from '../investments-transactions/entities/investment-transaction.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { ITryUpdateInvestmentProduct } from '../../types/transactions/try-update-inveestment-product.interface';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { TransactionTypesService } from '../transaction-types/transaction-types.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEnum } from '../events/event.enum';
import { InvestmentCompletedEvent } from '../events/dto/investment-completed.event';
import { IInvestmentsGetInfo } from '../../types/api-responses/investments/get-info.interface';
import { calculateInvestmentIncome } from '../../utils/investments/calculate-investment-income';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class InvestmentsService {
  private readonly _investmentTerm: number;
  private readonly _referralLevelsTotalPercentageMaxLimit: number;
  private readonly _maxInvestmentAmount: number;
  constructor(
    @Inject(forwardRef(() => AccountStatementsService))
    private readonly accountStatementsService: AccountStatementsService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly investmentsTransactionsService: InvestmentsTransactionsService,
    private readonly logger: Logger,
    private readonly productsService: ProductsService,
    @InjectRepository(Investment)
    private readonly repository: Repository<Investment>,
    private readonly referralLevelsService: ReferralLevelsService,
    private readonly transactionTypesService: TransactionTypesService,
  ) {
    this._investmentTerm = this.configService.get('investments.term');
    this._referralLevelsTotalPercentageMaxLimit = this.configService.get(
      'referralProgram.totalPercentageMaxLimit',
    );
    this._maxInvestmentAmount = this.configService.get('investments.maxAmount');
  }

  /**
   * Create new Investment
   * @param data data to create Investment
   * @returns created Investment
   */

  async create(data: ICreateInvestment) {
    const { userId, amount, productId } = data;

    let investmentId: string;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const { manager } = queryRunner;

    try {
      await this._validateCreation({
        manager,
        userId,
        amount,
      });

      const { startDate, dueDate } = defineInvestmentDates(
        this._investmentTerm,
      );
      const investmentInsertResult = await manager.insert(Investment, {
        userId,
        startDate,
        dueDate,
        amount,
        productId,
      });
      investmentId = investmentInsertResult.identifiers[0].id;

      await createDepositInvestmentTransactions({
        manager,
        investmentId,
        amount,
        userId,
      });

      await this._giveInvestmentReferralReward({
        manager,
        userId,
        amount,
        investmentId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.investmentCreation}
      Message: ${error.message}
      Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    return await this.findOneOrFail({
      id: investmentId,
    });
  }

  /**
   * Validate investment creation
   * @param data data to validate investment creation
   * @returns void
   * @throws error
   */

  private async _validateCreation({
    manager,
    userId,
    amount,
  }: IValidateInvestmentCreation) {
    const investment = await manager.findOneBy(Investment, {
      userId,
      completedAt: IsNull(),
      canceledAt: IsNull(),
    });
    if (investment) {
      throw new UnprocessableEntityException(errorMsgs.investmentExists);
    }
    const balance = await this.accountStatementsService.getBalanceTransactional(
      {
        userId,
        manager,
      },
    );
    const topProduct = await manager.findOneOrFail(Product, {
      where: { price: Not(IsNull()) },
      order: { price: SortOrder.DESC },
    });
    if (topProduct.price < amount) {
      throw new BadRequestException(
        `${errorMsgs.investmentMaxAmount} ${convertCentsToDollars(
          topProduct.price,
        )}`,
      );
    }

    if (balance < amount) {
      throw new BadRequestException(errorMsgs.insufficientBalance);
    }
  }

  /**
   * Give referral reward for investment
   * @param data data to give reward
   * @returns void
   */

  private async _giveInvestmentReferralReward({
    manager,
    userId,
    amount,
    investmentId,
  }: IGiveInvestmentReferralReward) {
    const { parentId } = await manager.findOneByOrFail(User, {
      id: userId,
    });

    const transactionTypeReward = await manager.findOneByOrFail(
      TransactionType,
      {
        name: TransactionTypeEnum.reward,
      },
    );

    await this.referralLevelsService.giveReward({
      manager,
      level: 1,
      parentId,
      investmentId,
      typeId: transactionTypeReward.id,
      amount,
    });
  }

  /**
   * Returns Investments
   * @param findOptions find options
   * @returns array of Investments
   */

  async find(findOptions: IFindInvestments) {
    return await qbFindInvestments(this.repository, findOptions);
  }

  /**
   * Returns Investment with transactions by find options or throw error
   * @param findOptions find options
   * @returns Investment
   * @throws NotFoundException if Investment not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<Investment> | FindOptionsWhere<Investment>[],
  ) {
    const investment = await this.repository.findOne({
      where: findOptions,
      relations: { investmentTransactions: { type: true } },
    });
    if (!investment) throw new NotFoundException(errorMsgs.investmentNotFound);
    return investment;
  }

  /**
   * Returns Investment by find options
   * @param data data to find Investment
   * @returns Investment or undefined
   */

  async findOne(findOptions: FindOneOptions<Investment>) {
    return await this.repository.findOne(findOptions);
  }

  /**
   * Replenish investment
   * @param data data to replenish investments
   * @returns investment
   */

  async replenish({ userId, amount }: IReplenishInvestment) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const manager = queryRunner.manager;

    try {
      const {
        investmentId,
        currentAmount,
        productId: currentProductId,
      } = await this._validateReplenish({
        manager,
        userId,
        amount,
      });
      await createDepositInvestmentTransactions({
        manager,
        investmentId,
        amount,
        userId,
      });

      await this._giveInvestmentReferralReward({
        manager,
        userId,
        amount,
        investmentId,
      });

      await manager.update(
        Investment,
        {
          id: investmentId,
        },
        {
          amount: currentAmount + amount,
          updatedAt: new Date(),
        },
      );

      await this._tryUpdateInvestmentProduct({
        manager,
        currentProductId,
        investmentId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.investmentReplenish}
      Message: ${error.message}
      Stack: ${error.stack}`);
      if (error.status >= 500) {
        throw new InternalServerErrorException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    } finally {
      await queryRunner.release();
    }

    return await this.findOneOrFail({
      userId,
      completedAt: IsNull(),
      canceledAt: IsNull(),
    });
  }

  /**
   * Validate replenish investment
   * @param data data to validate replenish investment
   * @returns investment id
   * @throws error
   */

  private async _validateReplenish({
    manager,
    userId,
    amount,
  }: IValidateReplenishInvestment) {
    const investment = await manager.findOneBy(Investment, {
      userId,
      completedAt: IsNull(),
      canceledAt: IsNull(),
      dueDate: MoreThan(moment().add(1, 'hours').toDate()),
    });
    if (!investment) {
      throw new UnprocessableEntityException(errorMsgs.investmentNotExists);
    }
    const { id: investmentId, amount: currentAmount, productId } = investment;
    const balance = await this.accountStatementsService.getBalanceTransactional(
      {
        userId,
        manager,
      },
    );

    if (balance < amount) {
      throw new BadRequestException(errorMsgs.insufficientBalance);
    }

    const investmentDepositsAmount =
      await this.investmentsTransactionsService.getInvestmentDepositsAmountBeforeDate(
        { manager, investmentId },
      );

    const topProduct = await manager.findOneOrFail(Product, {
      where: { price: Not(IsNull()) },
      order: { price: SortOrder.DESC },
    });

    if (topProduct.price < amount + investmentDepositsAmount) {
      throw new BadRequestException(
        `${errorMsgs.investmentMaxAmount} ${convertCentsToDollars(
          topProduct.price,
        )}`,
      );
    }
    return { investmentId, currentAmount, productId };
  }

  /**
   * Updates the investment's product
   * @param data data to update investment's product
   * @return void
   */

  private async _tryUpdateInvestmentProduct({
    manager,
    currentProductId,
    investmentId,
  }: ITryUpdateInvestmentProduct) {
    const topProduct = await manager.findOneOrFail(Product, {
      where: { price: Not(IsNull()) },
      order: { price: SortOrder.DESC },
    });

    if (topProduct.id !== currentProductId) {
      const investmentDepositsAmount =
        await this.investmentsTransactionsService.getInvestmentDepositsAmountBeforeDate(
          {
            investmentId,
            manager,
          },
        );
      const product = await this.productsService.getProductByAmount({
        manager,
        amount: investmentDepositsAmount,
      });
      if (product.id !== currentProductId) {
        const partialEntity: QueryDeepPartialEntity<Investment> = {
          productId: product.id,
        };
        if (product.isProlongsInvestment) {
          const { startDate, dueDate } = defineInvestmentDates(
            this._investmentTerm,
          );
          partialEntity.startDate = startDate;
          partialEntity.dueDate = dueDate;
        }
        await manager.update(Investment, { id: investmentId }, partialEntity);
      }
    }
  }

  /**
   * Cancel investment
   * @param userId user id
   */

  public async cancel(userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    const manager = queryRunner.manager;
    let investmentId: string;
    try {
      const investment = await manager.findOne(Investment, {
        where: { userId, completedAt: IsNull(), canceledAt: IsNull() },
        relations: { investmentTransactions: { type: true } },
      });
      if (!investment) {
        throw new UnprocessableEntityException(errorMsgs.investmentNotFound);
      }
      investmentId = investment.id;
      const investmentDepositsAmount = calculateInvestmentDepositsAmount(
        investment.investmentTransactions,
      );

      const referralPaymentsAmount = Math.round(
        (this._referralLevelsTotalPercentageMaxLimit *
          investmentDepositsAmount) /
          100,
      );

      const paidIncomeAmount = calculateInvestmentIncome(
        investment.investmentTransactions,
      );

      const fineAmount = referralPaymentsAmount + paidIncomeAmount;

      const withdrawalAmount = investmentDepositsAmount - fineAmount;

      await createCancelationInvestmentTransactions({
        manager,
        investmentId,
        userId,
        withdrawalAmount,
        fineAmount,
      });

      await manager.update(
        Investment,
        { id: investmentId },
        {
          amount: investmentDepositsAmount,
          income: 0,
          fine: fineAmount,
          canceledAt: new Date(),
        },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.investmentCancelation}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.investmentCancelation);
    } finally {
      await queryRunner.release();
    }
    return await this.findOneOrFail({
      id: investmentId,
    });
  }

  /**
   * Investment income accrual
   * @param data income calculation data
   * @returns void
   */

  public async incomeAccrual({
    userId,
    investmentId,
    investmentAmountSnapshotDate,
    todayProductsEarningsSettings,
    profitTransactionTypeId,
    withdrawalTransactionTypeId,
  }: IInvestmentIncomeAccrual) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    try {
      const investmentDepositsAmount =
        await this.investmentsTransactionsService.getInvestmentDepositsAmountBeforeDate(
          { investmentId, date: investmentAmountSnapshotDate, manager },
        );
      const investmentProduct = await this.productsService.getProductByAmount({
        manager,
        amount: investmentDepositsAmount,
      });
      const todayProductsEarningsSetting = todayProductsEarningsSettings.find(
        (setting) => setting.productId === investmentProduct.id,
      );
      if (!todayProductsEarningsSetting) {
        throw new InternalServerErrorException(
          `${errorMsgs.productEarningsSettingNotFound}
          Investment id: ${investmentId}`,
        );
      }
      const { percentage, date, productId } = todayProductsEarningsSetting;
      const incomePercentage = convertNumberToPercentage(percentage);
      const income = Math.round(
        (investmentDepositsAmount * incomePercentage) / 100,
      );
      const investmentProfitTransactionId = (
        await manager.insert(InvestmentTransaction, {
          investmentId,
          typeId: profitTransactionTypeId,
          amount: income,
          productEarningsSettingDate: date,
          productEarningsSettingProductId: productId,
        })
      ).identifiers[0].id;
      const { createdAt: profitCreatedAt } = await manager.findOneBy(
        InvestmentTransaction,
        {
          id: investmentProfitTransactionId,
        },
      );
      const createdAt = moment(profitCreatedAt).add(1, 'milliseconds').toDate();

      const investmentWithdrawalTransactionInsertResult = await manager.insert(
        InvestmentTransaction,
        {
          investmentId,
          typeId: withdrawalTransactionTypeId,
          amount: income,
          createdAt,
        },
      );
      const investmentWithdrawalTransactionId =
        investmentWithdrawalTransactionInsertResult.identifiers[0].id;

      const createdTransaction = queryRunner.manager.create(Transaction, {
        userId,
        investmentTransactionId: investmentWithdrawalTransactionId,
        amount: income,
        typeId: profitTransactionTypeId,
        createdAt,
      });
      await queryRunner.manager.save(Transaction, createdTransaction);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.incomeAccrual}
        Investment id: ${investmentId}
        Message: ${error.message}
        Stack: ${error.stack}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Complete investment and withdraw funds
   * @param data data to complete investment
   * @returns void
   */

  public async completeInvestment({
    investmentId,
    userId,
  }: {
    investmentId: string;
    userId: string;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    try {
      const investmentDepositsAmount =
        await this.investmentsTransactionsService.getInvestmentDepositsAmountBeforeDate(
          {
            investmentId,
            manager,
          },
        );
      const investmentIncome =
        await this.investmentsTransactionsService.getInvestmentIncome({
          investmentId,
          manager,
        });
      const investmentWithdrawal =
        await this.investmentsTransactionsService.getInvestmentIncomeWithdrawal(
          {
            investmentId,
            manager,
          },
        );
      const investmentBalance =
        investmentDepositsAmount + investmentIncome - investmentWithdrawal;
      const depositType = await manager.findOneByOrFail(TransactionType, {
        name: TransactionTypeEnum.deposit,
      });
      const withdrawalType = await manager.findOneByOrFail(TransactionType, {
        name: TransactionTypeEnum.withdrawal,
      });
      await manager.update(
        Investment,
        { id: investmentId },
        { amount: investmentDepositsAmount, income: investmentIncome },
      );
      const investmentTransactionInsertResult = await manager.insert(
        InvestmentTransaction,
        {
          investmentId,
          amount: investmentBalance,
          typeId: withdrawalType.id,
        },
      );
      const investmentTransactionId =
        investmentTransactionInsertResult.identifiers[0].id;

      const createdTransaction = queryRunner.manager.create(Transaction, {
        userId,
        investmentTransactionId,
        amount: investmentBalance,
        typeId: depositType.id,
      });
      await queryRunner.manager.save(Transaction, createdTransaction);

      this.eventEmitter.emit(
        EventEnum.investmentCompleted,
        new InvestmentCompletedEvent({
          userId,
          investmentDepositsAmount,
          income: investmentIncome,
        }),
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.investmentComplete}
        id: ${investmentId}
        Message: ${error.message}
        Stack: ${error.stack}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get total income
   * @param userId user id
   * @returns amount
   */

  public async getTotalIncome(userId: string) {
    const { stringAmount }: { stringAmount: string } = await this.repository
      .createQueryBuilder('investment')
      .select('SUM(investment.income)', 'stringAmount')
      .where('investment.userId = :userId', {
        userId,
      })
      .andWhere('investment.completedAt IS NOT NULL')
      .andWhere('investment.canceledAt IS NULL')
      .getRawOne();
    return stringAmount ? parseInt(stringAmount, 10) : 0;
  }

  /**
   * Get the amount of fines
   * @param userId user id
   * @returns number
   */

  public async getFinesAmount(userId: string) {
    const { stringAmount }: { stringAmount: string } = await this.repository
      .createQueryBuilder('investment')
      .select('SUM(investment.fine)', 'stringAmount')
      .where('investment.userId = :userId', {
        userId,
      })
      .andWhere('investment.canceledAt IS NOT NULL')
      .getRawOne();
    return stringAmount ? parseInt(stringAmount, 10) : 0;
  }

  /**
   * Get last update info
   * @param userId user id
   * @returns info or null
   */

  public async getLastUpdateInfo(userId: string) {
    const lastInvestment = await this.repository.findOne({
      where: { userId, canceledAt: IsNull() },
      order: { createdAt: SortOrder.DESC },
    });
    if (lastInvestment) {
      const { id: investmentId } = lastInvestment;
      const { id: typeId } = await this.transactionTypesService.findOneOrFail({
        name: TransactionTypeEnum.income,
      });
      const lastInvestmentIncomeTransaction =
        await this.investmentsTransactionsService.findOne({
          where: { investmentId, typeId },
          order: { createdAt: SortOrder.DESC },
          relations: { productEarningsSetting: true },
        });
      if (lastInvestmentIncomeTransaction) {
        return {
          lastUpdateDate: lastInvestmentIncomeTransaction.createdAt,
          lastIncomePercent:
            lastInvestmentIncomeTransaction.productEarningsSetting.percentage,
        };
      }
    }
    return null;
  }

  /**
   * Get information about investment returns
   * @param userId user id
   * @returns info
   */

  public async getInfo(userId: string): Promise<IInvestmentsGetInfo> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    const balance = await this.accountStatementsService.getBalanceTransactional(
      { userId, manager },
    );
    await queryRunner.commitTransaction();
    await queryRunner.release();

    const totalIncome = await this.getTotalIncome(userId);
    const finesNumber = await this.repository.count({
      where: { userId, canceledAt: Not(IsNull()), fine: Not(IsNull()) },
    });
    const finesAmount = await this.getFinesAmount(userId);
    const investment = await this.repository.findOneBy({
      userId,
      completedAt: IsNull(),
      canceledAt: IsNull(),
      dueDate: MoreThan(new Date()),
    });

    return {
      balance: convertCentsToDollars(balance),
      totalIncome: convertCentsToDollars(totalIncome),
      finesNumber,
      finesAmount: convertCentsToDollars(finesAmount),
      productId: investment?.productId,
    };
  }

  /**
   * Returns the user's investment amount
   * @param userId user id
   * @returns amount
   */

  public async getInvestmentsAmount(userId: string) {
    const { stringAmount }: { stringAmount: string } = await this.repository
      .createQueryBuilder('investment')
      .select('SUM(investment.amount)', 'stringAmount')
      .where('investment.userId = :userId', { userId })
      .getRawOne();
    return stringAmount ? parseInt(stringAmount, 10) : 0;
  }
}
