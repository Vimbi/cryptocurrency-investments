import { Brackets, Repository } from 'typeorm';
import { Product } from '../../resources/products/entities/product.entity';
import { SortOrder } from '../sort-order.enum';
import { FindProductsDto } from '../../resources/products/dto/find-products.dto';

export const qbFindProducts = async (
  repository: Repository<Product>,
  body: FindProductsDto,
) => {
  const { search, sort, page, limit, localeId } = body;
  const skip = (page - 1) * limit;

  const qr = repository
    .createQueryBuilder('product')
    .leftJoinAndSelect(
      'product.localeContent',
      'localeContent',
      'localeContent.localeId = :localeId',
      { localeId },
    );

  if (search) {
    qr.andWhere(
      new Brackets((qb) => {
        qb.where('product.displayName ILIKE :displayName', {
          displayName: '%' + search + '%',
        });
      }),
    );
  }

  if (sort) {
    sort.forEach((sortBy) =>
      qr.addOrderBy(
        `product.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    qr.orderBy('product.displayName', SortOrder.ASC);
  }

  const [entities, itemCount] = await qr
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
