import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { Locale } from './entities/locale.entity';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { SortOrder } from '../../utils/sort-order.enum';
import { UpdateLocaleDto } from './dto/update-locale.dto';

@Injectable()
export class LocalesService {
  constructor(
    @InjectRepository(Locale)
    private repository: Repository<Locale>,
  ) {}

  /**
   * Create new Locale
   * @param dto data to create Locale
   * @returns created Locale
   */

  async create(dto: CreateLocaleDto) {
    const result = await this.repository.insert(dto);
    return await this.repository.findOne({
      where: { id: result.identifiers[0].id },
    });
  }

  /**
   * Returns Locales
   * @returns array of Locales
   */

  async find() {
    return await this.repository.find({
      order: { displayName: SortOrder.ASC },
    });
  }

  /**
   * Returns Locale by find options of throw error
   * @param findOptions find options
   * @return Locale
   * @throws NotFoundException if Locale not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<Locale> | FindOptionsWhere<Locale>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) {
      throw new NotFoundException(errorMsgs.localeNotFound);
    }
    return result;
  }

  /**
   * Updates Locale
   * @param dto data to update Locale
   * @returns updated Locale
   */

  async update(dto: UpdateLocaleDto) {
    const { localeId: id, ...data } = dto;
    await this.repository.update({ id }, data);
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Delete Locale
   * @param id Locale id
   * @returns void
   */

  async delete(findOptions: FindOptionsWhere<Locale>) {
    const {
      articlesLocaleContent,
      articleTypesLocaleContent,
      articleFiles,
      productsLocaleContent,
      raffleFiles,
      rafflesLocaleContent,
      transactionTypesLocaleContent,
      transferStatusesLocaleContent,
      transferTypesLocaleContent,
    } = await this.repository.findOne({
      where: findOptions,
      relations: {
        articlesLocaleContent: true,
        articleTypesLocaleContent: true,
        articleFiles: true,
        productsLocaleContent: true,
        raffleFiles: true,
        rafflesLocaleContent: true,
        transactionTypesLocaleContent: true,
        transferStatusesLocaleContent: true,
        transferTypesLocaleContent: true,
      },
    });
    if (
      articlesLocaleContent.length ||
      rafflesLocaleContent.length ||
      articleFiles.length ||
      raffleFiles.length ||
      articleTypesLocaleContent.length ||
      productsLocaleContent.length ||
      transactionTypesLocaleContent.length ||
      transferStatusesLocaleContent.length ||
      transferTypesLocaleContent.length
    ) {
      throw new ConflictException(errorMsgs.localeHasRelations);
    }

    await this.repository.delete(findOptions);
  }
}
