import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RaffleFile } from './entities/raffle-file.entity';

@Injectable()
export class RaffleFilesService {
  constructor(
    @InjectRepository(RaffleFile)
    private repository: Repository<RaffleFile>,
  ) {}

  /**
   * Returns RaffleFile by find options
   * @param findOptions find options
   * @return RaffleFile or undefined
   */

  async findOne(
    findOptions: FindOptionsWhere<RaffleFile> | FindOptionsWhere<RaffleFile>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns RaffleFiles
   * @param findOptions find options
   * @returns array of RaffleFiles
   */

  async find(
    findOptions: FindOptionsWhere<RaffleFile> | FindOptionsWhere<RaffleFile>[],
  ) {
    return await this.repository.find({ where: findOptions });
  }

  /**
   * Removes RaffleFiles
   * @param findOptions find options
   * @returns void
   */

  async delete(findOptions: FindOptionsWhere<RaffleFile>) {
    await this.repository.delete(findOptions);
  }
}
