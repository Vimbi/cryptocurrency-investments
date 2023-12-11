import { Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { ProductEarningsSetting } from '../../resources/product-earnings-settings/entities/product-earnings-setting.entity';
import { FindProductEarningsSettingsDto } from '../../resources/product-earnings-settings/dto/find-product-earnings-settings.dto';

export const qbFindProductEarningsSettings = async (
  repository: Repository<ProductEarningsSetting>,
  body: FindProductEarningsSettingsDto,
) => {
  const { sort, page, limit, productId, afterDate, beforeDate } = body;
  const skip = (page - 1) * limit;

  const query = repository.createQueryBuilder('setting');

  if (productId) {
    query.andWhere('setting.productId = :productId', { productId });
  }

  if (afterDate) {
    query.andWhere('setting.date >= :afterDate', { afterDate });
  }

  if (beforeDate) {
    query.andWhere('setting.date <= :beforeDate', { beforeDate });
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `setting.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('setting.date', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
