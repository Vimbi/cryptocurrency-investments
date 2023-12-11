import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { Network } from './entities/network.entity';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';
import { TransferStatusEnum } from '../transfer-statuses/transfer-status.enum';
import { TransferStatusesService } from '../transfer-statuses/transfer-statuses.service';

@Injectable()
export class NetworksService {
  constructor(
    @InjectRepository(Network)
    private repository: Repository<Network>,
    private readonly transferStatusesService: TransferStatusesService,
  ) {}

  /**
   * Create new Network
   * @param dto data to create Network
   * @returns created Network
   */

  async create(dto: CreateNetworkDto) {
    const insertResult = await this.repository.insert(dto);
    return await this.repository.findOneBy({
      id: insertResult.identifiers[0].id,
    });
  }

  /**
   * Returns Networks
   * @param findOptions find options
   * @returns array of Networks
   */

  async find(
    findOptions: FindOptionsWhere<Network> | FindOptionsWhere<Network>[],
  ) {
    return await this.repository.find({ where: findOptions });
  }

  /**
   * Returns Networks by find options
   * @param findOptions find options
   * @return Network or undefined
   */

  async findOneBy(
    findOptions: FindOptionsWhere<Network> | FindOptionsWhere<Network>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns Network by find options or throw error
   * @param findOptions find options
   * @returns Network
   * @throws NotFoundException if Network not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<Network> | FindOptionsWhere<Network>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.networkNotFound);
    return result;
  }

  /**
   * Updates Network
   * @param findOptions find options
   * @param dto data to update Network
   * @returns updated Network
   * @throws NotFoundException if Network not found
   */

  async update(findOptions: FindOptionsWhere<Network>, dto: UpdateNetworkDto) {
    const network = await this.findOneOrFail(findOptions);
    await this._validateDepositAddressUpdate({
      depositAddress: dto.depositAddress,
      networkId: network.id,
    });
    await this.repository.update(findOptions, {
      ...dto,
      updatedAt: new Date(),
    });
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Validates the ability to update the network deposit address
   * @param data data to validate
   * @returns void
   */

  private async _validateDepositAddressUpdate({
    depositAddress,
    networkId,
  }: {
    depositAddress: string;
    networkId: string;
  }) {
    if (depositAddress) {
      const statusPending = await this.transferStatusesService.findOneOrFail({
        name: TransferStatusEnum.pending,
      });
      const statusProcessed = await this.transferStatusesService.findOneOrFail({
        name: TransferStatusEnum.processed,
      });
      const networkWithTransfers = await this.repository
        .createQueryBuilder('network')
        .leftJoinAndSelect(
          'network.transfers',
          'transfer',
          'transfer.statusId IN (:...statuses)',
          { statuses: [statusPending.id, statusProcessed.id] },
        )
        .where('network.id = :id', { id: networkId })
        .getOne();
      if (networkWithTransfers.transfers.length) {
        throw new ConflictException(errorMsgs.depositAddressHasTransfers);
      }
    }
  }

  /**
   * Removes Network
   * @param findOptions find options
   * @returns void
   * @throws NotFoundException if Network not found
   */

  async delete(findOptions: FindOptionsWhere<Network>) {
    await this.findOneOrFail(findOptions);
    await this.repository.delete(findOptions);
  }
}
