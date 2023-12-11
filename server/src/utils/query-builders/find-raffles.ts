import { Brackets, Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { Raffle } from '../../resources/raffles/entities/raffle.entity';
import { FindRafflesDto } from '../../resources/raffles/dto/find-raffles.dto';

export const qbFindRaffles = async (
  repository: Repository<Raffle>,
  findOptions: FindRafflesDto,
) => {
  const {
    search,
    sort,
    page,
    limit,
    afterDate,
    beforeDate,
    isCompleted,
    isPublished,
    localeId,
    theme,
  } = findOptions;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder('raffle')
    .leftJoinAndSelect(
      'raffle.localeContent',
      'localeContent',
      'localeContent.localeId = :localeId',
      { localeId },
    );

  if (theme) {
    query.leftJoinAndSelect(
      'raffle.files',
      'raffleFile',
      'raffleFile.localeId = :fileLocaleId AND (raffleFile.theme = :theme OR raffleFile.theme IS NULL)',
      { theme, fileLocaleId: localeId },
    );
  } else {
    query.leftJoinAndSelect(
      'raffle.files',
      'raffleFile',
      'raffleFile.localeId = :fileLocaleId',
      { fileLocaleId: localeId },
    );
  }

  query.leftJoinAndSelect('raffleFile.file', 'file');

  if (findOptions.hasOwnProperty(Object.keys({ isPublished })[0])) {
    query.andWhere('raffle.isPublished = :isPublished', { isPublished });
  }

  if (findOptions.hasOwnProperty(Object.keys({ isCompleted })[0])) {
    const now = new Date();
    if (isCompleted) {
      query.andWhere('raffle.endDate < :now1', { now1: now });
    } else {
      query
        .andWhere('raffle.endDate > :now2', { now2: now })
        .andWhere('raffle.startDate < :now3', { now3: now });
    }
  }

  if (afterDate) {
    query.andWhere('raffle.startDate >= :afterDate', { afterDate });
  }

  if (beforeDate) {
    query.andWhere('raffle.startDate <= :beforeDate', { beforeDate });
  }

  if (search) {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('raffle.title ILIKE :title', {
          title: '%' + search + '%',
        }).orWhere('raffle.description ILIKE :description', {
          description: '%' + search + '%',
        });
      }),
    );
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `raffle.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('raffle.startDate', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
