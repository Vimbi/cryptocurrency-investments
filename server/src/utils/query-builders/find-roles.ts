import { Brackets, Repository } from 'typeorm';
import { Role } from '../../resources/roles/entities/role.entity';
import { GetQueryDto } from '../../types/get-query.dto';
import { SortOrder } from '../sort-order.enum';

export const qbFindRoles = async (
  repository: Repository<Role>,
  body: GetQueryDto,
) => {
  const { search, sort, page, limit } = body;
  const skip = (page - 1) * limit;

  const qr = repository.createQueryBuilder('role');

  if (search) {
    qr.andWhere(
      new Brackets((qb) => {
        qb.where('role.name ILIKE :name', {
          name: '%' + search + '%',
        }).orWhere('role.displayName ILIKE :displayName', {
          displayName: '%' + search + '%',
        });
      }),
    );
  }

  if (sort) {
    sort.forEach((sortBy) =>
      qr.addOrderBy(`role.${sortBy[0]}`, sortBy[1].toUpperCase() as SortOrder),
    );
  } else {
    qr.orderBy('role.displayName', SortOrder.ASC);
  }

  const [entities, itemCount] = await qr
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
