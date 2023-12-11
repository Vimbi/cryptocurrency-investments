import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TransferStatus } from './entities/transfer-status.entity';
import { CreateTransferStatusDto } from './dto/create-transfer-status.dto';
import { errorMsgs } from '../../shared/error-messages';
import { UpdateTransferStatusDto } from './dto/update-transfer-status.dto';
import { FindTransferStatusesDto } from './dto/find-transfer-statuses.dto';

@Injectable()
export class TransferStatusesService {
  constructor(
    @InjectRepository(TransferStatus)
    private repository: Repository<TransferStatus>,
  ) {}

  /**
   * Create new Transfer Status
   * @param dto data to create Transfer Status
   * @returns created Transfer Status
   */

  async create(dto: CreateTransferStatusDto) {
    const insertResult = await this.repository.insert(dto);
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns Transfer Statuses
   * @returns array of Transfer Statuses
   */

  async find({ localeId }: FindTransferStatusesDto) {
    const query = this.repository.createQueryBuilder('transferStatus');

    if (localeId) {
      query.leftJoinAndSelect(
        'transferStatus.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      );
    } else {
      query.leftJoinAndSelect('transferStatus.localeContent', 'localeContent');
    }
    return await query.getMany();
  }

  /**
   * Returns Transfer Status by find options
   * @param findOptions find option
   * @return Transfer Status or undefined
   */

  async findOneBy(
    findOptions:
      | FindOptionsWhere<TransferStatus>
      | FindOptionsWhere<TransferStatus>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns Transfer Status or fail
   * @param findOptions find options
   * @returns Transfer Status
   * @throws NotFoundException if Transfer Status not found
   */

  async findOneOrFail(
    findOptions:
      | FindOptionsWhere<TransferStatus>
      | FindOptionsWhere<TransferStatus>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.transferStatusNotFound);
    return result;
  }

  /**
   * Updates Transfer Status by id
   * @param findOptions find options
   * @param dto data to update Transfer Status
   * @returns updated Transfer Status
   * @throws NotFoundException if Transfer Status not found
   */

  async update(
    findOptions: FindOptionsWhere<TransferStatus>,
    dto: UpdateTransferStatusDto,
  ) {
    await this.findOneOrFail(findOptions);
    await this.repository.update(findOptions, {
      ...dto,
      updatedAt: new Date(),
    });
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Removes Transfer Status by id
   * @param id Transfer Status id
   * @returns void
   * @throws NotFoundException if Transfer Status not found
   */

  async delete(findOptions: FindOptionsWhere<TransferStatus>) {
    await this.findOneOrFail(findOptions);
    await this.repository.delete(findOptions);
  }
}
