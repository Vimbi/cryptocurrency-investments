import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TransferInfo } from './entitites/transfer-info.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class TransferInfoService {
  constructor(
    @InjectRepository(TransferInfo)
    private repository: Repository<TransferInfo>,
  ) {}

  /**
   * Increments attempts
   * @param transferId transfer id
   * @returns void
   */

  public async incrementAttempts(transferId: string) {
    await this.repository
      .createQueryBuilder('transferInfo')
      .where('"transferInfo"."transferId" = :transferId', { transferId })
      .update()
      .set({
        attempts: () => 'attempts + 1',
        updatedAt: new Date(),
      })
      .execute();
  }

  /**
   * Add an error message
   * @param transferId transfer id
   * @returns void
   */

  public async pushMessage({
    transferId,
    message,
  }: {
    transferId: string;
    message: string;
  }) {
    await this.repository
      .createQueryBuilder('info')
      .update()
      .set({
        errorMessages: () => `array_append("errorMessages", '${message}')`,
        updatedAt: new Date(),
      })
      .where('info."transferId" = :transferId', { transferId })
      .execute();
  }

  /**
   * Updates Transfer info
   * @param findOptions find options
   * @param partialEntity data to update
   * @returns void
   */

  public async update(
    findOptions: FindOptionsWhere<TransferInfo>,
    partialEntity: QueryDeepPartialEntity<TransferInfo>,
  ) {
    await this.repository.update(findOptions, {
      ...partialEntity,
      updatedAt: new Date(),
    });
  }
}
