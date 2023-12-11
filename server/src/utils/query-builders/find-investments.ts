import { Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { Investment } from '../../resources/investments/entities/investment.entity';
import { IFindInvestments } from '../../types/investments/find-transfers.interface';

export const qbFindInvestments = async (
  repository: Repository<Investment>,
  findOptions: IFindInvestments,
) => {
  const { userId, sort, page, limit, afterDate, beforeDate } = findOptions;
  const skip = (page - 1) * limit;

  const query = repository.createQueryBuilder('investment');
  query.leftJoinAndSelect(
    'investment.investmentTransactions',
    'investmentTransaction',
  );
  query.leftJoinAndSelect('investmentTransaction.type', 'type');

  if (userId) {
    query.andWhere('investment.userId = :userId', { userId });
  }

  if (afterDate) {
    query.andWhere('investment.createdAt >= :afterDate', { afterDate });
  }

  if (beforeDate) {
    query.andWhere('investment.createdAt <= :beforeDate', { beforeDate });
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `investment.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('investment.createdAt', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
