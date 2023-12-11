import { Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { File } from '../../resources/files/entities/file.entity';
import { GetQueryDto } from '../../types/get-query.dto';

export const qbFindFiles = async (
  repository: Repository<File>,
  findOptions: GetQueryDto,
) => {
  const { sort, page, limit } = findOptions;
  const skip = (page - 1) * limit;

  const query = repository.createQueryBuilder('file');

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `file.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('file.createdAt', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
