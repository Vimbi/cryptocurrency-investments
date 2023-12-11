import { Brackets, Repository } from 'typeorm';
import { UserStatus } from '../../resources/user-statuses/entities/user-status.entity';
import { GetQueryDto } from '../../types/get-query.dto';
import { SortOrder } from '../sort-order.enum';

export const qbFindUserStatuses = async (
  repository: Repository<UserStatus>,
  dto: GetQueryDto,
) => {
  const { search, sort, page, limit } = dto;
  const skip = (page - 1) * limit;

  const qr = repository.createQueryBuilder('userStatus');

  if (search) {
    qr.andWhere(
      new Brackets((qb) => {
        qb.where('userStatus.name ILIKE :name', {
          name: '%' + search + '%',
        }).orWhere('userStatus.displayName ILIKE :displayName', {
          displayName: '%' + search + '%',
        });
      }),
    );
  }

  if (sort) {
    sort.forEach((sortBy) =>
      qr.addOrderBy(
        `userStatus.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    qr.orderBy('userStatus.displayName', SortOrder.ASC);
  }

  const [entities, itemCount] = await qr
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
