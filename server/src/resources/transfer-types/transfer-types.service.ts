import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TransferType } from './entities/transfer-type.entity';
import { UpdateTransferTypeDto } from './dto/update-transfer-type.dto';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class TransferTypesService {
  constructor(
    @InjectRepository(TransferType)
    private repository: Repository<TransferType>,
  ) {}

  /**
   * Returns all Transfer Statuses
   * @returns array of Transfer Statuses
   */

  async findAll() {
    return await this.repository.find();
  }

  /**
   * Returns Transfer type or fail
   * @param findOptions find options
   * @returns Transfer type
   * @throws NotFoundException if Transfer type not found
   */

  async findOneOrFail(
    findOptions:
      | FindOptionsWhere<TransferType>
      | FindOptionsWhere<TransferType>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.tranfserTypeNotFound);
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
    findOptions: FindOptionsWhere<TransferType>,
    dto: UpdateTransferTypeDto,
  ) {
    const transferType = await this.repository.findOneBy(findOptions);
    if (!transferType) {
      throw new NotFoundException(errorMsgs.tranfserTypeNotFound);
    }
    await this.repository.update(findOptions, dto);
    return await this.repository.findOneBy(findOptions);
  }
}
