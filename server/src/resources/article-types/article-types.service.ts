import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { ArticleType } from './entities/article-type.entity';
import { CreateArticleTypeDto } from './dto/create-article-type.dto';
import { UpdateArticleTypeDto } from './dto/update-article-type.dto';
import { ArticleTypeLocaleContent } from '../article-type-locale-content/entities/article-type-locale-content.entity';
import { FindArticleTypesDto } from './dto/find-article-types.dto';

@Injectable()
export class ArticleTypesService {
  private readonly _logger = new Logger(ArticleTypesService.name);
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ArticleType)
    private repository: Repository<ArticleType>,
  ) {}

  /**
   * Create new ArticleType
   * @param dto data to create ArticleType
   * @returns created ArticleType
   */

  async create(dto: CreateArticleTypeDto) {
    const { localeContent, ...data } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    let articleTypeId: string;

    try {
      const insertResult = await manager.insert(ArticleType, data);
      articleTypeId = insertResult.identifiers[0].id;

      for (const content of localeContent) {
        await manager.insert(ArticleTypeLocaleContent, {
          ...content,
          typeId: articleTypeId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.articleTypeCreateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.articleTypeCreateError);
    } finally {
      await queryRunner.release();
    }

    return await this.repository.findOne({
      where: { id: articleTypeId },
      relations: { localeContent: true },
    });
  }

  /**
   * Returns all ArticleTypes
   * @returns array of ArticleTypes
   */

  async find(dto: FindArticleTypesDto) {
    const { localeId } = dto;
    const query = this.repository.createQueryBuilder('articleType');
    if (localeId) {
      query.leftJoinAndSelect(
        'articleType.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      );
    } else {
      query.leftJoinAndSelect('articleType.localeContent', 'localeContent');
    }

    return await query.getMany();
  }

  /**
   * Returns ArticleType by find options
   * @param findOptions find option
   * @return ArticleType or undefined
   */

  async findOne({
    articleTypeId,
    localeId,
  }: {
    articleTypeId: string;
    localeId?: string;
  }) {
    const query = this.repository
      .createQueryBuilder('articleType')
      .where('articleType.id = :articleTypeId', { articleTypeId });

    if (localeId) {
      query.leftJoinAndSelect(
        'articleType.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      );
    } else {
      query.leftJoinAndSelect('articleType.localeContent', 'localeContent');
    }

    return await query.getOne();
  }

  /**
   * Returns ArticleType or fail
   * @param findOptions find options
   * @returns ArticleType
   * @throws NotFoundException if ArticleType not found
   */

  async findOneOrFail(
    findOptions:
      | FindOptionsWhere<ArticleType>
      | FindOptionsWhere<ArticleType>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.articleTypeNotFound);
    return result;
  }

  /**
   * Updates ArticleType by id
   * @param findOptions find options
   * @param dto data to update ArticleType
   * @returns updated ArticleType
   * @throws NotFoundException if ArticleType not found
   */

  async update(
    findOptions: FindOptionsWhere<ArticleType>,
    dto: UpdateArticleTypeDto,
  ) {
    const { id } = await this.findOneOrFail(findOptions);
    const { localeContent, ...data } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      if (data) {
        await manager.update(ArticleType, findOptions, {
          ...data,
          updatedAt: new Date(),
        });
      }
      if (localeContent?.length) {
        for (const content of localeContent) {
          await manager.save(ArticleTypeLocaleContent, {
            ...content,
            typeId: id,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.articleTypeUpdate}
      Message: ${error.message}
      Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.articleTypeUpdate);
    } finally {
      await queryRunner.release();
    }

    return await this.findOne({ articleTypeId: id });
  }

  /**
   * Removes ArticleType by id
   * @param id ArticleType id
   * @returns void
   * @throws NotFoundException if ArticleType not found
   */

  async delete(findOptions: FindOptionsWhere<ArticleType>) {
    const { id } = await this.findOneOrFail(findOptions);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      await manager.delete(ArticleTypeLocaleContent, { typeId: id });
      await manager.delete(ArticleType, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.articleTypeDeleteError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.articleTypeDeleteError);
    } finally {
      await queryRunner.release();
    }
  }
}
