import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvestmentTransaction } from './entities/investment-transaction.entity';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { TransactionTypeEnum } from '../transaction-types/transaction-type.enum';
import { IGetInvestmentDepositsAmountBeforeDate } from '../../types/investments/get-investment-deposits-amount-before-date.interface';
import { IFindInvestmentsTransactions } from '../../types/investments-transactions/find-investments-transactions.interface';
import { qbFindInvestmentsTransactions } from '../../utils/query-builders/find-investments-transactions';

@Injectable()
export class InvestmentsTransactionsService {
  constructor(
    @InjectRepository(InvestmentTransaction)
    private readonly repository: Repository<InvestmentTransaction>,
  ) {}

  /**
   * Get the amount of investment deposits up to the given date
   * @param data data to get the amount of investment deposits
   * @returns amount
   */

  public async getInvestmentDepositsAmountBeforeDate({
    investmentId,
    date,
    manager,
  }: IGetInvestmentDepositsAmountBeforeDate) {
    const query = manager
      .createQueryBuilder()
      .select()
      .from(InvestmentTransaction, 'investmentTransaction')
      .leftJoinAndSelect('investmentTransaction.type', 'type')
      .select('SUM(investmentTransaction.amount)', 'stringAmount')
      .where('investmentTransaction.investmentId = :investmentId', {
        investmentId,
      })
      .andWhere('type.name = :typeName', {
        typeName: TransactionTypeEnum.deposit,
      });

    if (date) {
      query.andWhere('investmentTransaction.createdAt <= :date', {
        date,
      });
    }

    const { stringAmount }: { stringAmount: string } = await query.getRawOne();
    return stringAmount ? parseInt(stringAmount, 10) : 0;
  }

  /**
   * Get investment income
   * @param data
   * @returns income
   */

  public async getInvestmentIncome({
    investmentId,
    manager,
  }: {
    investmentId: string;
    manager: EntityManager;
  }) {
    const { stringAmount }: { stringAmount: string } = await manager
      .createQueryBuilder()
      .select()
      .from(InvestmentTransaction, 'investmentTransaction')
      .leftJoinAndSelect('investmentTransaction.type', 'type')
      .select('SUM(investmentTransaction.amount)', 'stringAmount')
      .where('investmentTransaction.investmentId = :investmentId', {
        investmentId,
      })
      .andWhere('type.name = :typeName', {
        typeName: TransactionTypeEnum.income,
      })
      .getRawOne();
    return stringAmount ? parseInt(stringAmount, 10) : 0;
  }

  /**
   * Get your income withdrawal amount
   * @param data
   * @returns amount
   */

  public async getInvestmentIncomeWithdrawal({
    investmentId,
    manager,
  }: {
    investmentId: string;
    manager: EntityManager;
  }) {
    const { stringAmount }: { stringAmount: string } = await manager
      .createQueryBuilder()
      .select()
      .from(InvestmentTransaction, 'investmentTransaction')
      .leftJoinAndSelect('investmentTransaction.type', 'type')
      .select('SUM(investmentTransaction.amount)', 'stringAmount')
      .where('investmentTransaction.investmentId = :investmentId', {
        investmentId,
      })
      .andWhere('type.name = :typeName', {
        typeName: TransactionTypeEnum.withdrawal,
      })
      .getRawOne();
    return stringAmount ? parseInt(stringAmount, 10) : 0;
  }

  /**
   * Find investment transaction
   * @param findOptions find options
   * @returns investment transaction or undefined
   */

  public async findOne(findOptions: FindOneOptions<InvestmentTransaction>) {
    return await this.repository.findOne(findOptions);
  }

  /**
   * Find investment transactions
   * @param findOptions find options
   * @returns array of investment transactions
   */

  public async find(findOptions: IFindInvestmentsTransactions) {
    return await qbFindInvestmentsTransactions(this.repository, findOptions);
  }
}
