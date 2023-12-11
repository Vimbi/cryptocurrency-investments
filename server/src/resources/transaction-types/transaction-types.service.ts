import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { TransactionType } from './entities/transaction-type.entity';
import { CreateTransactionTypeDto } from './dto/create-transaction-type.dto';
import { UpdateTransactionTypeDto } from './dto/update-transaction-type.dto';
import { TransactionTypeLocaleContent } from '../transaction-types-locale-content/entities/transaction-type-locale-content.entity';
import { FindTransactionTypesDto } from './dto/find-transaction-types.dto';

@Injectable()
export class TransactionTypesService {
  private readonly _logger = new Logger(TransactionTypesService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(TransactionType)
    private readonly repository: Repository<TransactionType>,
  ) {}

  /**
   * Create new TransactionType
   * @param dto data to create TransactionType
   * @returns created TransactionType
   */

  async create(dto: CreateTransactionTypeDto) {
    const { localeContent, ...data } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    let transactionTypeId: string;
    try {
      const insertResult = await manager.insert(TransactionType, data);
      transactionTypeId = insertResult.identifiers[0].id;

      await manager.insert(TransactionTypeLocaleContent, {
        ...localeContent,
        typeId: transactionTypeId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.transactionTypeCreateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(
        errorMsgs.transactionTypeCreateError,
      );
    } finally {
      await queryRunner.release();
    }

    return await this.repository.findOne({
      where: { id: transactionTypeId },
      relations: { localeContent: true },
    });
  }

  /**
   * Returns all TransactionTypes
   * @returns array of TransactionTypes
   */

  async findAll(dto: FindTransactionTypesDto) {
    const { localeId } = dto;
    const query = this.repository.createQueryBuilder('transactionType');

    if (localeId) {
      query.leftJoinAndSelect(
        'transactionType.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      );
    }
    return await query.getMany();
  }

  /**
   * Returns TransactionType by find options
   * @param findOptions find option
   * @return TransactionType or undefined
   */

  async findOneBy(
    findOptions:
      | FindOptionsWhere<TransactionType>
      | FindOptionsWhere<TransactionType>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns TransactionType or fail
   * @param findOptions find options
   * @returns TransactionType
   * @throws NotFoundException if TransactionType not found
   */

  async findOneOrFail(
    findOptions:
      | FindOptionsWhere<TransactionType>
      | FindOptionsWhere<TransactionType>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.transactionTypeNotFound);
    return result;
  }

  /**
   * Returns TransactionType
   * @param findOptions find options
   * @returns TransactionType
   */

  async findOneWithContent({
    transactionTypeId,
    localeId,
  }: {
    transactionTypeId: string;
    localeId?: string;
  }) {
    const query = this.repository
      .createQueryBuilder('transactionType')
      .where('transactionType.id = :transactionTypeId', { transactionTypeId });

    if (localeId) {
      query.leftJoinAndSelect(
        'transactionType.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      );
    } else {
      query.leftJoinAndSelect('transactionType.localeContent', 'localeContent');
    }
    return await query.getOne();
  }

  /**
   * Updates TransactionType by id
   * @param findOptions find options
   * @param dto data to update TransactionType
   * @returns updated TransactionType
   * @throws NotFoundException if TransactionType not found
   */

  async update(dto: UpdateTransactionTypeDto) {
    const { transactionTypeId: id, localeContent } = dto;
    await this.findOneOrFail({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      await manager.save(TransactionTypeLocaleContent, {
        ...dto,
        updatedAt: new Date(),
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.transactionTypeUpdateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(
        errorMsgs.transactionTypeUpdateError,
      );
    } finally {
      await queryRunner.release();
    }
    return await this.findOneWithContent({
      transactionTypeId: id,
      localeId: localeContent.localeId,
    });
  }
}
