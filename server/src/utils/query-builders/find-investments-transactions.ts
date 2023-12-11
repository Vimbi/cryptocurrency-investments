import { Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { InvestmentTransaction } from '../../resources/investments-transactions/entities/investment-transaction.entity';
import { IFindInvestmentsTransactions } from '../../types/investments-transactions/find-investments-transactions.interface';

export const qbFindInvestmentsTransactions = async (
  repository: Repository<InvestmentTransaction>,
  findOptions: IFindInvestmentsTransactions,
) => {
  const { userId, sort, page, limit, afterDate, beforeDate, typeId, localeId } =
    findOptions;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder('investmentTransaction')
    .select([
      'investmentTransaction.id',
      'investmentTransaction.amount',
      'investmentTransaction.createdAt',
    ])
    .leftJoin('investmentTransaction.investment', 'investment')
    .leftJoinAndSelect('investmentTransaction.type', 'type');

  if (localeId) {
    query.leftJoinAndSelect(
      'type.localeContent',
      'localeContent',
      'localeContent.localeId = :localeId',
      { localeId },
    );
  } else {
    query.leftJoinAndSelect('type.localeContent', 'localeContent');
  }

  if (userId) {
    query.andWhere('investment.userId = :userId', { userId });
  }

  if (afterDate) {
    query.andWhere('investmentTransaction.createdAt >= :afterDate', {
      afterDate,
    });
  }

  if (beforeDate) {
    query.andWhere('investmentTransaction.createdAt <= :beforeDate', {
      beforeDate,
    });
  }

  if (typeId) {
    query.andWhere('type.id = :typeId', { typeId });
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `investmentTransaction.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('investmentTransaction.createdAt', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
