import { Brackets, Repository } from 'typeorm';
import { SortOrder } from '../sort-order.enum';
import { Article } from '../../resources/articles/entities/article.entity';
import { FindArticlesDto } from '../../resources/articles/dto/find-articles.dto';

export const qbFindArticles = async (
  repository: Repository<Article>,
  findOptions: FindArticlesDto,
) => {
  const {
    search,
    sort,
    page,
    limit,
    afterDate,
    beforeDate,
    typeId,
    isPublished,
    localeId,
    theme,
  } = findOptions;
  const skip = (page - 1) * limit;

  const query = repository
    .createQueryBuilder('article')
    .leftJoinAndSelect(
      'article.localeContent',
      'localeContent',
      'localeContent.localeId = :localeId',
      { localeId },
    )
    .leftJoinAndSelect('article.type', 'type');

  if (theme) {
    query.leftJoinAndSelect(
      'article.articleFiles',
      'articleFile',
      'articleFile.localeId = :fileLocaleId AND (articleFile.theme = :theme OR articleFile.theme IS NULL)',
      { theme, fileLocaleId: localeId },
    );
  } else {
    query.leftJoinAndSelect(
      'article.articleFiles',
      'articleFile',
      'articleFile.localeId = :fileLocaleId',
      { fileLocaleId: localeId },
    );
  }

  query.leftJoinAndSelect('articleFile.file', 'file');

  if (findOptions.hasOwnProperty(Object.keys({ isPublished })[0])) {
    query.andWhere('article.isPublished = :isPublished', { isPublished });
  }

  if (typeId) {
    query.andWhere('article.typeId = :typeId', { typeId });
  }

  if (afterDate) {
    query.andWhere('article.createdAt >= :afterDate', { afterDate });
  }

  if (beforeDate) {
    query.andWhere('article.createdAt <= :beforeDate', { beforeDate });
  }

  if (search) {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('article.title ILIKE :title', {
          title: '%' + search + '%',
        }).orWhere('article.text ILIKE :text', {
          text: '%' + search + '%',
        });
      }),
    );
  }

  if (sort) {
    sort.forEach((sortBy) =>
      query.addOrderBy(
        `article.${sortBy[0]}`,
        sortBy[1].toUpperCase() as SortOrder,
      ),
    );
  } else {
    query.orderBy('article.createdAt', SortOrder.DESC);
  }

  const [entities, itemCount] = await query
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return { entities, limit, page, itemCount };
};
