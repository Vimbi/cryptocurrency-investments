import { Repository } from 'typeorm';
import { Transfer } from '../../resources/transfers/entities/transfer.entity';
import { IGetTransfers } from '../../types/transfers/get-transfers.interface';
import { SortOrder } from '../sort-order.enum';

export const qbFindTransfers = async (
  repository: Repository<Transfer>,
  findOptions: IGetTransfers,
) => {
  const {
    userId,
    sort,
    page,
    limit,
    statusId,
    typeId,
    currencyId,
    afterDate,
    beforeDate,
    localeId,
    networkId,
  } = findOptions;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder('transfer')
    .leftJoinAndSelect('transfer.status', 'status')
    .leftJoinAndSelect('transfer.network', 'network')
    .leftJoinAndSelect('network.currency', 'currency')
    .leftJoinAndSelect('transfer.type', 'type');

  if (localeId) {
    query
      .leftJoinAndSelect(
        'type.localeContent',
        'typeLocaleContent',
        'typeLocaleContent.localeId = :localeId',
        { localeId },
      )
      .leftJoinAndSelect(
        'status.localeContent',
        'statusLocaleContent',
        'statusLocaleContent.localeId = :localeId',
        { localeId },
      );
  } else {
    query
      .leftJoinAndSelect('type.localeContent', 'typeLocaleContent')
      .leftJoinAndSelect('status.localeContent', 'statusLocaleContent');
  }

  if (userId) {
    query.andWhere('transfer.userId = :userId', { userId });
  }

  if (statusId) {
    query.andWhere('transfer.statusId = :statusId', {
      statusId,
    });
  }

  if (typeId) {
    query.andWhere('transfer.typeId = :typeId', {
      typeId,
    });
  }

  if (networkId) {
    query.andWhere('transfer.networkId = :networkId', {
      networkId,
    });
  }

  if (currencyId) {
    query.andWhere('network.currencyId = :currencyId', {
      currencyId,
    });
  }

  if (afterDate) {
    query.andWhere('transfer.createdAt >= :afterDate', { afterDate });
  }

  if (beforeDate) {
    query.andWhere('transfer.createdAt <= :beforeDate', { beforeDate });
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `transfer.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('transfer.createdAt', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
