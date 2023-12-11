import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { UsersService } from '../users/users.service';
import { Raffle } from './entities/raffle.entity';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { RaffleFile } from '../raffle-files/entities/raffle-file.entity';
import { FindRafflesDto } from './dto/find-raffles.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { qbFindRaffles } from '../../utils/query-builders/find-raffles';
import { RaffleLocaleContent } from '../raffles-local-content/entities/raffle-locale-content.entity';
import { ThemeEnum } from '../files/theme.enum';
import { FindRaffleDto } from './dto/find-raffle.dto';

@Injectable()
export class RafflesService {
  private readonly _logger = new Logger(RafflesService.name);
  constructor(
    @InjectRepository(Raffle)
    private repository: Repository<Raffle>,
    private dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create new Raffle
   * @param dto data to create Raffle
   * @returns created Raffle
   */

  async create(dto: CreateRaffleDto) {
    const { localeContent, ...data } = dto;
    const { files, ...restData } = localeContent;
    const { localeId } = localeContent;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    let raffleId: string;

    try {
      const insertResult = await manager.insert(Raffle, data);
      raffleId = insertResult.identifiers[0].id;

      await manager.insert(RaffleLocaleContent, {
        ...restData,
        raffleId,
      });

      if (files?.length) {
        for (const file of files) {
          await manager.insert(RaffleFile, {
            ...file,
            raffleId,
            localeId,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.raffleCreateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.raffleCreateError);
    } finally {
      await queryRunner.release();
    }

    return await this.repository.findOne({
      where: { id: raffleId },
      relations: { files: { file: true }, localeContent: true },
    });
  }

  /**
   * Returns Raffles by options
   * @param dto options
   * @returns array of Raffles, limit, page, entities count
   */

  async find(dto: FindRafflesDto) {
    return await qbFindRaffles(this.repository, dto);
  }

  /**
   * Returns Raffle by find options of throw error
   * @param findOptions find options
   * @return Raffle
   * @throws NotFoundException if Raffle not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<Raffle> | FindOptionsWhere<Raffle>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) {
      throw new NotFoundException(errorMsgs.raffleNotFound);
    }
    return result;
  }

  /**
   * Returns Raffle
   * @param findOptions find options
   * @returns Raffle
   */

  async findOneWithContent({
    raffleId,
    localeId,
    theme,
  }: {
    raffleId: string;
    localeId: string;
    theme?: ThemeEnum;
  }) {
    const query = this.repository
      .createQueryBuilder('raffle')
      .leftJoinAndSelect(
        'raffle.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      )
      .where('raffle.id = :raffleId', { raffleId });

    if (theme) {
      query.leftJoinAndSelect(
        'raffle.files',
        'raffleFile',
        'raffleFile.localeId = :fileLocaleId AND (raffleFile.theme = :theme  OR raffleFile.theme IS NULL)',
        {
          theme,
          fileLocaleId: localeId,
        },
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
    return await query.getOne();
  }

  /**
   * Returns Raffle by find options of throw error
   * @param findOptions find options
   * @return Raffle
   * @throws NotFoundException if Raffle not found
   */

  async findOnePublic({ dto, userId }: { dto: FindRaffleDto; userId: string }) {
    const result = await this.findOneWithContent(dto);
    if (!result) {
      throw new NotFoundException(errorMsgs.raffleNotFound);
    }
    if (!result.isPublished) {
      if (userId) {
        const isAdmin = this.usersService.checkAccess(userId);
        if (!isAdmin) {
          throw new NotFoundException(errorMsgs.raffleNotFound);
        }
      } else {
        throw new NotFoundException(errorMsgs.raffleNotFound);
      }
    }
    return result;
  }

  /**
   * Updates Raffle
   * @param dto data to update Raffle
   * @returns updated Raffle
   * @throws NotFoundException if Raffle not found
   */

  async update(dto: UpdateRaffleDto) {
    const { raffleId: id, localeContent, ...data } = dto;
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
          Raffle,
          { id },
          { ...data, updatedAt: new Date() },
        );
      }
      if (files) {
        await manager.delete(RaffleFile, { raffleId: id, localeId });
        for (const file of files) {
          await manager.insert(RaffleFile, {
            ...file,
            raffleId: id,
            localeId,
          });
        }
      }
      if (restData) {
        await manager.save(RaffleLocaleContent, {
          ...restData,
          raffleId: id,
          updatedAt: new Date(),
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.raffleUpdateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.raffleUpdateError);
    } finally {
      await queryRunner.release();
    }
    return await this.findOneWithContent({ raffleId: id, localeId });
  }

  /**
   * Delete Raffle by id
   * @param id Raffle id
   * @returns void
   * @throws NotFoundException if Raffle not found
   */

  async delete(id: string) {
    await this.findOneOrFail({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      await manager.delete(RaffleFile, { raffleId: id });
      await manager.delete(RaffleLocaleContent, { raffleId: id });
      await manager.delete(Raffle, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.raffleDeleteError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.raffleDeleteError);
    } finally {
      await queryRunner.release();
    }
  }
}
