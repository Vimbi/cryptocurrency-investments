import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GetQueryDto } from '../../types/get-query.dto';
import { qbFindUserStatuses } from '../../utils/query-builders/find-user-statuses';
import { UserStatusDto } from './dto/user.status.dto';
import { UserStatus } from './entities/user-status.entity';

@Injectable()
export class UserStatusesService {
  constructor(
    @InjectRepository(UserStatus)
    private statusRepository: Repository<UserStatus>,
  ) {}

  /**
   * Create new User Status
   * @param statusDto data to create User Status
   * @returns created User Status
   */

  async create(statusDto: UserStatusDto) {
    const insertResult = await this.statusRepository.insert(statusDto);
    return await this.statusRepository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns User Statuses by pagination options
   * @param dto pagination options
   * @returns array of User Statuses, limit, page, entities count
   */

  async find(dto: GetQueryDto) {
    return await qbFindUserStatuses(this.statusRepository, dto);
  }

  /**
   * Returns User Status by conditions
   * @param fields object where keys are search columns, values are search column values
   * @return User Status or undefined
   */

  async findOneBy(
    fields: FindOptionsWhere<UserStatus> | FindOptionsWhere<UserStatus>[],
  ) {
    return await this.statusRepository.findOneBy(fields);
  }

  /**
   * Returns User Status by id
   * @param findOptions find options
   * @returns User Status
   * @throws NotFoundException if User Status not found
   */

  async findOne(
    findOptions: FindOptionsWhere<UserStatus> | FindOptionsWhere<UserStatus>[],
  ) {
    const result = await this.statusRepository.findOneBy(findOptions);
    if (!result) throw new NotFoundException();
    return result;
  }

  /**
   * Updates User Status by id
   * @param id User Status id
   * @param statusDto data to update User Status
   * @returns updated User Status
   * @throws NotFoundException if User Status not found
   */

  async update(id: string, statusDto: UserStatusDto) {
    await this.findOne({ id });
    await this.statusRepository.update(id, statusDto);
    return await this.statusRepository.findOneBy({ id });
  }

  /**
   * Removes User Status by id
   * @param id User Status id
   * @returns void
   * @throws NotFoundException if User Status not found
   */

  async delete(id: string) {
    await this.findOne({ id });
    await this.statusRepository.delete(id);
  }
}
