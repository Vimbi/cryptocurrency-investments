import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { errorMsgs } from '../../shared/error-messages';
import { ProductEarningsSetting } from './entities/product-earnings-setting.entity';
import { CreateProductEarningsSettingDto } from './dto/create-product-earnings-setting.dto';
import { UpdateProductEarningsSettingDto } from './dto/update-product-earnings-setting.dto';
import { FindProductEarningsSettingsDto } from './dto/find-product-earnings-settings.dto';
import { qbFindProductEarningsSettings } from '../../utils/query-builders/find-product-earnings-settings';

@Injectable()
export class ProductEarningsSettingsService {
  constructor(
    @InjectRepository(ProductEarningsSetting)
    private repository: Repository<ProductEarningsSetting>,
  ) {}

  /**
   * Create new ProductEarningsSetting
   * @param dto data to create ProductEarningsSetting
   * @returns created ProductEarningsSetting
   */

  async create(dto: CreateProductEarningsSettingDto) {
    const { date, productId } = dto;
    await this.repository.insert(dto);
    return await this.repository.findOneBy({
      date,
      productId,
    });
  }

  /**
   * Returns Products
   * @param findOptions find options
   * @returns array of Products
   */

  async find(dto: FindProductEarningsSettingsDto) {
    return await qbFindProductEarningsSettings(this.repository, dto);
  }

  /**
   * Returns ProductEarningsSetting by find options
   * @param findOptions find options
   * @return ProductEarningsSetting or undefined
   */

  async findOneBy(
    findOptions:
      | FindOptionsWhere<ProductEarningsSetting>
      | FindOptionsWhere<ProductEarningsSetting>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns ProductEarningsSetting by where condition or throw error
   * @param findOptions where condition
   * @returns ProductEarningsSetting
   * @throws NotFoundException if ProductEarningsSetting not found
   */

  async findOneByOrFail(
    findOptions:
      | FindOptionsWhere<ProductEarningsSetting>
      | FindOptionsWhere<ProductEarningsSetting>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result)
      throw new NotFoundException(errorMsgs.productEarningsSettingNotFound);
    return result;
  }

  /**
   * Returns ProductEarningsSetting by find options or throw error
   * @param findOptions find options
   * @returns ProductEarningsSetting
   * @throws NotFoundException if ProductEarningsSetting not found
   */

  async findOneOrFail(findOptions: FindOneOptions<ProductEarningsSetting>) {
    const result = await this.repository.findOne(findOptions);
    if (!result)
      throw new NotFoundException(errorMsgs.productEarningsSettingNotFound);
    return result;
  }

  /**
   * Updates ProductEarningsSetting
   * @param dto data to update ProductEarningsSetting
   * @returns updated ProductEarningsSetting
   * @throws NotFoundException if ProductEarningsSetting not found
   */

  async update(
    findOptions: FindOptionsWhere<ProductEarningsSetting>,
    dto: UpdateProductEarningsSettingDto,
  ) {
    await this.findOneByOrFail(findOptions);
    await this.repository.update(findOptions, {
      ...dto,
      updatedAt: new Date(),
    });
    return await this.repository.findOneBy(findOptions);
  }
}
