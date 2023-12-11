import { Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { UserWallet } from '../../resources/user-wallets/entities/user-wallet.entity';
import { IFindUserWallets } from '../../types/user-wallet/find-user-wallets.interface';

export const qbFindUserWallets = async (
  repository: Repository<UserWallet>,
  findOptions: IFindUserWallets,
) => {
  const { search, sort, page, limit, networkId, userId } = findOptions;
  const skip = (page - 1) * limit;

  const query = repository.createQueryBuilder('userWallet');
  query.leftJoinAndSelect('userWallet.network', 'network');
  query.where('userWallet.userId = :userId', { userId });

  if (networkId) {
    query.andWhere('userWallet.networkId = :networkId', { networkId });
  }

  if (search) {
    query.andWhere('userWallet.note ILIKE :note', {
      note: '%' + search + '%',
    });
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `userWallet.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('userWallet.createdAt', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
