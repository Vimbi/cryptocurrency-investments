import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { UserWallet } from './entities/user-wallet.entity';
import { ICreateUserWallet } from '../../types/user-wallet/create-user-wallet.interface';
import { qbFindUserWallets } from '../../utils/query-builders/find-wallets';
import { IFindUserWallets } from '../../types/user-wallet/find-user-wallets.interface';
import { ConfigService } from '@nestjs/config';
import { NetworksService } from '../networks/networks.service';

@Injectable()
export class UserWalletsService {
  private readonly _maxLimitUserWallets: number;
  constructor(
    private readonly networksService: NetworksService,
    @InjectRepository(UserWallet)
    private repository: Repository<UserWallet>,
    private configService: ConfigService,
  ) {
    this._maxLimitUserWallets = this.configService.get('userWallets.maxLimit');
  }

  /**
   * Create new UserWallet
   * @param dto data to create UserWallet
   * @returns created UserWallet
   */

  async create(data: ICreateUserWallet) {
    const { userId, networkId } = data;
    const { currencyId } = await this.networksService.findOneOrFail({
      id: networkId,
    });
    const number = await this._countByCurrency({
      userId,
      currencyId,
    });
    if (number >= this._maxLimitUserWallets) {
      throw new BadRequestException(
        `${errorMsgs.userWalletsLimit} ${this._maxLimitUserWallets}`,
      );
    }

    const insertResult = await this.repository.insert(data);
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns UserWallets
   * @param findOptions find options
   * @returns array of UserWallet
   */

  async find(findOptions: IFindUserWallets) {
    return await qbFindUserWallets(this.repository, findOptions);
  }

  /**
   * Returns UserWallet by find options or throw error
   * @param findOptions find options
   * @returns UserWallet
   * @throws NotFoundException if UserWallet not found
   */

  async findOneOrFail(findOptions: FindOneOptions<UserWallet>) {
    const result = await this.repository.findOne(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.userWalletNotFound);
    return result;
  }

  /**
   * Removes UserWallet
   * @param findOptions find options
   * @returns void
   * @throws NotFoundException if UserWallet not found
   */

  async delete(findOptions: FindOptionsWhere<UserWallet>) {
    await this.findOneOrFail({ where: findOptions });
    await this.repository.delete(findOptions);
  }

  /**
   * Counts the number of user wallets by currency
   * @param data data to count
   * @returns number
   */

  private async _countByCurrency({
    currencyId,
    userId,
  }: {
    currencyId: string;
    userId: string;
  }) {
    const { stringSum }: { stringSum: string } = await this.repository
      .createQueryBuilder('userWallet')
      .leftJoin('userWallet.network', 'network')
      .leftJoin('network.currency', 'currency')
      .select('COUNT(userWallet.id)', 'stringSum')
      .andWhere('userWallet.userId = :userId', { userId })
      .andWhere('currency.id = :currencyId', { currencyId })
      .getRawOne();
    return !stringSum ? 0 : parseInt(stringSum, 10);
  }
}
