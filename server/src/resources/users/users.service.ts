import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as referralCodes from 'referral-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { User } from './entities/user.entity';
import { RoleEnum } from '../roles/roles.enum';
import { Forgot } from '../forgot/entities/forgot.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { GetUsersDto } from './dto/get-users.dto';
import { ICreateUser } from '../../types/users/create-user.interface';
import { ICreateUserTransaction } from '../../types/users/create-user-transaction.interface';
import { qbFindUsersByUser } from '../../utils/query-builders/find-users-by-user';
import { IGetChildren } from '../../types/users/get-children.interface';
import { ConfigService } from '@nestjs/config';
import { GetUsersByUserDto } from './dto/get-users-by-user.dto';
import { IChildValidation } from '../../types/users/child-validation.interface';
import { qbFindUsers } from '../../utils/query-builders/find-users';
import { InvestmentsService } from '../investments/investments.service';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';

@Injectable()
export class UsersService {
  private _maxLevel: number;
  private _referralCodeLength: number;
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
    private readonly investmentsService: InvestmentsService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private logger: Logger,
  ) {
    this._maxLevel = this.configService.get('referralProgram.maxLevel');
    this._referralCodeLength = this.configService.get(
      'referralProgram.codeLength',
    );
  }

  /**
   * Create user
   * @param dto data to create user
   */

  async create(dto: ICreateUser) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.createTransaction({
        ...dto,
        entityManager: queryRunner.manager,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.userCreateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.userCreateError);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create new User transaction
   * @param data data to create User
   * @return created User
   */

  async createTransaction(data: ICreateUserTransaction) {
    const { entityManager, ...userInfo } = data;

    const referralCode = referralCodes.generate({
      length: this._referralCodeLength,
      count: 1,
    })[0];
    const userEntity = entityManager.create(User, {
      ...userInfo,
      referralCode,
    });
    const user = await entityManager.save(User, userEntity);
    return user;
  }

  /**
   * Returns User by options
   * @param dto find options
   * @returns array of entities and pagination data
   */

  async find(userId: string, dto: GetUsersDto) {
    const isSuperAdmin = await this.checkAccessSuperAdmin(userId);

    return await qbFindUsers({
      repository: this.usersRepository,
      dto,
      isSuperAdmin,
    });
  }

  /**
   * Returns Users by options
   * @param dto find options
   * @returns array of User
   */

  async findByUser(userId: string, dto: GetUsersByUserDto) {
    const { childId } = dto;
    if (childId) {
      await this._childValidation({ userId, childId });
    }

    const result = await qbFindUsersByUser({
      repository: this.usersRepository,
      dto,
      userId,
    });
    for (const user of result.entities) {
      user.investmentsAmount = convertCentsToDollars(
        await this.investmentsService.getInvestmentsAmount(user.id),
      );
    }
    return result;
  }

  /**
   * Checks if the user is a member of a team
   * @param data data to check the child
   * @returns void
   * @throws BadRequestException
   */

  private async _childValidation({ userId, childId }: IChildValidation) {
    const children = await this.getChildren({
      level: 1,
      userId,
      children: [],
    });
    const isValidChildId = children.find((child) => child.id === childId);
    if (!isValidChildId) {
      throw new BadRequestException(errorMsgs.childInvalid);
    }
  }

  /**
   * Getting all child users
   * @param args data to get all child users
   * @returns array of child users
   */

  public async getChildren(args: IGetChildren) {
    const { level, userId, children } = args;
    if (level <= this._maxLevel) {
      const nextLevel = level + 1;
      const users = await this.usersRepository.find({
        where: { parentId: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          surname: true,
          createdAt: true,
          referralCode: true,
          parentId: true,
        },
      });
      if (users.length > 0) {
        children.push(...users);
        for (const user of users) {
          await this.getChildren({
            userId: user.id,
            children,
            level: nextLevel,
          });
        }
      }
    }
    return children;
  }

  /**
   * Returns all Users
   * @returns array of Users
   */

  async findAll() {
    return await this.usersRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        surname: true,
        createdAt: true,
        referralCode: true,
        parentId: true,
      },
    });
  }

  /**
   * Return user depending on the requesting user
   * @param userId User id
   * @param findOptions find options
   * @returns User or undefined
   */

  async findOnePublic(
    userId: string,
    findOptions: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ) {
    const access = this.checkAccessSuperAdmin(userId);

    const query = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.firstName',
        'user.lastName',
        'user.surname',
        'user.createdAt',
        'user.referralCode',
      ])
      .loadRelationCountAndMap('user.teamCount', 'user.children')
      .setFindOptions({ where: findOptions });

    if (access) {
      query.addSelect([
        'user.phone',
        'user.email',
        'user.roleId',
        'user.statusId',
      ]);
    }

    return await query.getOne();
  }

  /**
   * Returns the user
   * @param findOptions find options
   * @returns User or undefined
   */

  async findOneLimited(
    findOptions: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.phone',
        'user.email',
        'user.firstName',
        'user.lastName',
        'user.surname',
        'user.createdAt',
        'user.referralCode',
        'user.isTwoFactorAuthenticationEnabled',
      ])
      .leftJoinAndSelect('user.role', 'role')
      .setFindOptions({ where: findOptions })
      .getOne();
  }

  /**
   * Returns User by find options
   * @param findOptions find options
   * @returns User
   * @throws NotFoundException if User not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ) {
    const user = await this.findOneBy(findOptions);
    if (!user) throw new NotFoundException(errorMsgs.userNotFound);
    return user;
  }

  /**
   * Returns User by conditions
   * @param findOptions find options
   * @return User or undefined
   */

  async findOneBy(
    findOptions: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .setFindOptions({ where: findOptions })
      .getOne();
  }

  /**
   * Returns User by conditions if user is not banned
   * @param findOptions find options
   * @return User or undefined
   */

  async findOne(
    findOptions: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ) {
    const user = await this.findOneBy(findOptions);
    return user;
  }

  /**
   * Updates User
   * @param findOptions find options
   * @param data data to update User
   * @returns updated User
   * @throws NotFoundException if User not found
   */

  async update(
    findOptions: FindOptionsWhere<User>,
    partialEntity: QueryDeepPartialEntity<User>,
  ) {
    await this.findOneOrFail(findOptions);
    await this.usersRepository.update(findOptions, {
      ...partialEntity,
      updatedAt: new Date(),
    });
    return await this.findOneOrFail(findOptions);
  }

  /**
   * User system update
   * @param findOptions find options
   * @param partialEntity partial entity
   */

  async systemUpdate(
    findOptions: FindOptionsWhere<User>,
    partialEntity: QueryDeepPartialEntity<User>,
  ) {
    await this.usersRepository.update(findOptions, {
      ...partialEntity,
      updatedAt: new Date(),
    });
  }

  /**
   * Soft removes User by id
   * @param id User id
   * @returns void
   * @throws NotFoundException if User not found
   */

  async softDelete(id: string): Promise<void> {
    await this.findOneOrFail({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(User, { id }, { deletedAt: new Date() });
      // TODO add some updates
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.userSoftDeleteError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.userSoftDeleteError);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Removes User by id
   * @param id User id
   * @returns void
   * @throws NotFoundException if User not found
   */

  public async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Forgot, { userId: id });
      await queryRunner.manager.delete(User, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${errorMsgs.userDeleteError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.userDeleteError);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check user access
   * @param id User id
   * @returns boolean
   */

  async checkAccess(id: string) {
    const user = await this.findOneOrFail({ id });
    return (
      user.role.name === RoleEnum.admin ||
      user.role.name === RoleEnum.superAdmin
    );
  }

  /**
   * Checks if user is super admin
   * @param id User id
   * @returns boolean
   */

  async checkAccessSuperAdmin(id: string) {
    const user = await this.findOneBy({ id });
    return user?.role.name === RoleEnum.superAdmin;
  }

  /**
   * Returns all referral users and itself
   * @param userId user id
   * @returns array of users
   */

  public async findWholeTeam(userId: string) {
    const children = await this.getChildren({
      level: 1,
      userId,
      children: [],
    });
    for (const child of children) {
      child.investmentsAmount = convertCentsToDollars(
        await this.investmentsService.getInvestmentsAmount(child.id),
      );
    }
    const itself = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        surname: true,
        createdAt: true,
        referralCode: true,
      },
    });
    itself.parentId = null;
    return [...children, itself];
  }
}
