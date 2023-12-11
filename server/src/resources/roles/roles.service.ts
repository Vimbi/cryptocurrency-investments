import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GetQueryDto } from '../../types/get-query.dto';
import { qbFindRoles } from '../../utils/query-builders/find-roles';
import { RoleDto } from './dto/role.dto';
import { Role } from './entities/role.entity';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * Create new Role
   * @param roleDto data to create Role
   * @returns created Role
   */

  async create(roleDto: RoleDto) {
    const insertResult = await this.roleRepository.insert(roleDto);
    return await this.roleRepository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns Roles by pagination options
   * @param paginationOptions pagination options
   * @returns array of Roles
   */

  async find(dto: GetQueryDto) {
    return await qbFindRoles(this.roleRepository, dto);
  }

  /**
   * Returns Role by conditions
   * @param fields object where keys are search columns, values are search column values
   * @return Role or undefined
   */

  async findOneBy(fields: FindOptionsWhere<Role> | FindOptionsWhere<Role>[]) {
    return await this.roleRepository.findOneBy(fields);
  }

  /**
   * Returns Role by id
   * @param id Role id
   * @returns Role
   * @throws NotFoundException if Role not found
   */

  async findOne(id: string) {
    const result = await this.roleRepository.findOneBy({ id });
    if (!result) throw new NotFoundException(errorMsgs.roleNotExist);
    return result;
  }

  /**
   * Updates Role by id
   * @param id Role id
   * @param roleDto data to update Role
   * @returns updated Role
   * @throws NotFoundException if Role not found
   */

  async update(id: string, roleDto: RoleDto) {
    await this.findOne(id);
    await this.roleRepository.update(id, roleDto);
    return await this.roleRepository.findOneBy({ id });
  }

  /**
   * Removes Role by id
   * @param id Role id
   * @returns void
   * @throws NotFoundException if Role not found
   */

  async delete(id: string) {
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }
}
