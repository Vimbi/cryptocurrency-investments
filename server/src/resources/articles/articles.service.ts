import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { qbFindArticles } from '../../utils/query-builders/find-articles';
import { FindArticlesDto } from './dto/find-articles.dto';
import { ArticleFile } from '../article-files/entities/article-file.entity';
import { UsersService } from '../users/users.service';
import { ArticleLocaleContent } from '../article-locale-content/entities/article-locale-content.entity';
import { FindArticleDto } from './dto/find-article.dto';
import { ThemeEnum } from '../files/theme.enum';

@Injectable()
export class ArticlesService {
  private readonly _logger = new Logger(ArticlesService.name);
  constructor(
    @InjectRepository(Article)
    private repository: Repository<Article>,
    private dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create new Article
   * @param dto data to create Article
   * @returns created Article
   */

  async create(dto: CreateArticleDto) {
    const { localeContent, ...data } = dto;
    const { files, ...restData } = localeContent;
    const { localeId } = localeContent;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    let articleId: string;

    try {
      const insertResult = await manager.insert(Article, data);
      articleId = insertResult.identifiers[0].id;

      await manager.insert(ArticleLocaleContent, {
        ...restData,
        articleId,
      });

      if (files?.length) {
        for (const file of files) {
          await manager.insert(ArticleFile, {
            ...file,
            articleId,
            localeId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.articleCreateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.articleCreateError);
    } finally {
      await queryRunner.release();
    }

    return await this.repository.findOne({
      where: { id: articleId },
      relations: { articleFiles: { file: true }, localeContent: true },
    });
  }

  /**
   * Returns Articles by options
   * @param dto options
   * @returns array of Banners, limit, page, entities count
   */

  async find(dto: FindArticlesDto) {
    return await qbFindArticles(this.repository, dto);
  }

  /**
   * Returns Article by find options of throw error
   * @param findOptions find options
   * @return Article
   * @throws NotFoundException if Article not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<Article> | FindOptionsWhere<Article>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) {
      throw new NotFoundException(errorMsgs.articleNotFound);
    }
    return result;
  }

  /**
   * Returns Article
   * @param findOptions find options
   * @returns Article
   */

  async findOneWithContent({
    articleId,
    localeId,
    theme,
  }: {
    articleId: string;
    localeId: string;
    theme?: ThemeEnum;
  }) {
    const query = this.repository
      .createQueryBuilder('article')
      .leftJoinAndSelect(
        'article.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      )
      .where('article.id = :articleId', { articleId });

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
    return await query.getOne();
  }

  /**
   * Returns Article by find options of throw error
   * @param findOptions find options
   * @return Article
   * @throws NotFoundException if Article not found
   */

  async findOnePublic({
    dto,
    userId,
  }: {
    dto: FindArticleDto;
    userId: string;
  }) {
    const result = await this.findOneWithContent(dto);

    if (!result) {
      throw new NotFoundException(errorMsgs.articleNotFound);
    }
    if (!result.isPublished) {
      if (userId) {
        const isAdmin = this.usersService.checkAccess(userId);
        if (!isAdmin) {
          throw new NotFoundException(errorMsgs.articleNotFound);
        }
      } else {
        throw new NotFoundException(errorMsgs.articleNotFound);
      }
    }
    return result;
  }

  /**
   * Updates Article
   * @param dto data to update Article
   * @returns updated Article
   * @throws NotFoundException if Article not found
   */

  async update(dto: UpdateArticleDto) {
    const { articleId: id, localeContent, ...data } = dto;
    const { files, ...restData } = localeContent;
    const { localeId } = restData;

    await this.findOneOrFail({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      if (data) {
        await manager.update(
          Article,
          { id },
          { ...data, updatedAt: new Date() },
        );
      }
      if (files) {
        await manager.delete(ArticleFile, { articleId: id, localeId });
        for (const file of files) {
          await manager.insert(ArticleFile, {
            ...file,
            articleId: id,
            localeId,
          });
        }
      }
      if (restData) {
        await manager.save(ArticleLocaleContent, {
          ...restData,
          articleId: id,
          updatedAt: new Date(),
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.articleUpdateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.articleUpdateError);
    } finally {
      await queryRunner.release();
    }
    return await this.findOneWithContent({ articleId: id, localeId });
  }

  /**
   * Delete Article by id
   * @param id Article id
   * @returns void
   * @throws NotFoundException if Article not found
   */

  async delete(id: string) {
    await this.findOneOrFail({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      await manager.delete(ArticleFile, { articleId: id });
      await manager.delete(ArticleLocaleContent, { articleId: id });
      await manager.delete(Article, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.articleDeleteError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.articleDeleteError);
    } finally {
      await queryRunner.release();
    }
  }
}
