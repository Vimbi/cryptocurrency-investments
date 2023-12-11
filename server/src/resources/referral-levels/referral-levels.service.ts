import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { ReferralLevel } from './entities/referral-level.entity';
import { CreateReferralLevelDto } from './dto/create-referral-level.dto';
import { SortOrder } from '../../utils/sort-order.enum';
import { UpdateReferralLevelDto } from './dto/update-referral-level.dto';
import { convertNumberToPercentage } from '../../utils/convert-number-to-percentage';
import { IGiveReward } from '../../types/transfers/give-reward.interface';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { calculateReward } from '../../utils/calculate-reward';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class ReferralLevelsService {
  private _referralProgramMaxLevel: number;
  constructor(
    @InjectRepository(ReferralLevel)
    private repository: Repository<ReferralLevel>,
    private readonly configService: ConfigService,
  ) {
    this._referralProgramMaxLevel = this.configService.get(
      'referralProgram.maxLevel',
    );
  }

  /**
   * Create new level
   * @param dto data to create level
   * @returns created level
   */

  async create(dto: CreateReferralLevelDto) {
    const insertResult = await this.repository.insert(dto);
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns level
   * @param findOptions find options
   * @returns array of levels
   */

  async find() {
    return await this.repository.find({ order: { level: SortOrder.ASC } });
  }

  /**
   * Returns level by find options
   * @param findOptions find options
   * @return level or undefined
   */

  async findOneBy(
    findOptions:
      | FindOptionsWhere<ReferralLevel>
      | FindOptionsWhere<ReferralLevel>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns level by find options or throw error
   * @param findOptions find options
   * @returns level
   * @throws NotFoundException if level not found
   */

  async findOneOrFail(
    findOptions:
      | FindOptionsWhere<ReferralLevel>
      | FindOptionsWhere<ReferralLevel>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.referralLevelNotFound);
    return result;
  }

  /**
   * Updates level
   * @param dto data to update level
   * @returns updated level
   * @throws NotFoundException if level not found
   */

  async update(dto: UpdateReferralLevelDto) {
    const { referrralLevelId: id, ...data } = dto;
    await this.findOneOrFail({ id });
    await this.repository.update(
      { id },
      {
        ...data,
        updatedAt: new Date(),
      },
    );
    return await this.repository.findOneBy({ id });
  }

  /**
   * Removes level
   * @param findOptions find options
   * @returns void
   * @throws NotFoundException if level not found
   */

  async delete(findOptions: FindOptionsWhere<ReferralLevel>) {
    await this.findOneOrFail(findOptions);
    await this.repository.delete(findOptions);
  }

  /**
   * Return sum of percentages of referral levels
   */

  async getTotalPercentage() {
    const { sum }: { sum: string } = await this.repository
      .createQueryBuilder('level')
      .select('SUM(level.percentage)', 'sum')
      .getRawOne();
    return sum ? convertNumberToPercentage(parseInt(sum, 10)) : 0;
  }

  /**
   * Count levels
   * @returns levels number
   */

  async count() {
    return this.repository.count();
  }

  /**
   * Give reward to user for referral program
   * @param data data to give reward
   * @returns void
   */

  public async giveReward({
    manager,
    level,
    parentId,
    investmentId,
    typeId,
    amount,
  }: IGiveReward) {
    if (level <= this._referralProgramMaxLevel) {
      const nextLevel = level + 1;
      const user = await manager.findOneBy(User, {
        id: parentId,
      });
      if (user) {
        const referralLevel = await manager.findOneBy(ReferralLevel, {
          level,
        });
        if (referralLevel?.status) {
          const percentage = convertNumberToPercentage(
            referralLevel.percentage,
          );
          const reward = calculateReward({ amount, percentage });
          const createdTransaction = manager.create(Transaction, {
            userId: user.id,
            amount: reward,
            typeId,
            investmentId,
            referralLevelPercentage: referralLevel.percentage,
          });
          await manager.save(Transaction, createdTransaction);
        }

        if (user.parentId) {
          await this.giveReward({
            manager,
            level: nextLevel,
            parentId: user.parentId,
            investmentId,
            typeId,
            amount,
          });
        }
      }
    }
  }
}
