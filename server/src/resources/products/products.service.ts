import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  LessThan,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { qbFindProducts } from '../../utils/query-builders/find-products';
import { errorMsgs } from '../../shared/error-messages';
import { UpdateProductDto } from './dto/update-product.dto';
import { CurrenciesService } from '../currencies/currencies.service';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { convertDollarsToCents } from '../../utils/convert-dollars-to-cents';
import { SortOrder } from '../../utils/sort-order.enum';
import { ProductLocaleContent } from '../products-locale-content/entities/product-locale-content.entity';
import { FindProductsDto } from './dto/find-products.dto';

@Injectable()
export class ProductsService {
  private readonly _logger = new Logger(ProductsService.name);
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    private readonly currenciesService: CurrenciesService,
  ) {}

  /**
   * Create new Product
   * @param dto data to create Product
   * @returns created Product
   */

  async create(dto: CreateProductDto) {
    const { localeContent, price, ...data } = dto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;
    let productId: string;

    try {
      const insertResult = await manager.insert(Product, {
        ...data,
        price: convertDollarsToCents(price),
      });
      productId = insertResult.identifiers[0].id;

      await manager.insert(ProductLocaleContent, {
        ...localeContent,
        productId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.productCreateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.productCreateError);
    } finally {
      await queryRunner.release();
    }

    return await this.repository.findOne({
      where: { id: productId },
      relations: { localeContent: true },
    });
  }

  /**
   * Returns Products
   * @param findOptions find options
   * @returns array of Products
   */

  async find(dto: FindProductsDto) {
    return await qbFindProducts(this.repository, dto);
  }

  /**
   * Returns all Products
   * @returns array of Products
   */

  async findAll() {
    return await this.repository.find();
  }

  /**
   * Returns Products with prices in cryptocurrency
   * @param findOptions find options
   * @returns array of Products
   */

  async findWithPrices(dto: FindProductsDto) {
    const products = await qbFindProducts(this.repository, dto);
    const currencies = await this.currenciesService.findWithRates();
    for (const product of products.entities) {
      for (const currency of currencies) {
        const priceInCryptocurrency =
          convertCentsToDollars(product.price) / currency.rate;
        product.cryptocurrencyPrices.push({
          symbol: currency.symbol,
          price: priceInCryptocurrency,
        });
      }
    }
    return products;
  }

  /**
   * Returns Product by find options
   * @param findOptions find options
   * @return Product or undefined
   */

  async findOneBy(
    findOptions: FindOptionsWhere<Product> | FindOptionsWhere<Product>[],
  ) {
    return await this.repository.findOneBy(findOptions);
  }

  /**
   * Returns Product by find options or throw error
   * @param findOptions find options
   * @returns Product
   * @throws NotFoundException if Product not found
   */

  async findOneOrFail(
    findOptions: FindOptionsWhere<Product> | FindOptionsWhere<Product>[],
  ) {
    const result = await this.repository.findOneBy(findOptions);
    if (!result) throw new NotFoundException(errorMsgs.productNotFound);
    return result;
  }

  /**
   * Returns Product
   * @param findOptions find options
   * @returns Product
   */

  async findOneWithContent({
    productId,
    localeId,
  }: {
    productId: string;
    localeId: string;
  }) {
    const query = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect(
        'product.localeContent',
        'localeContent',
        'localeContent.localeId = :localeId',
        { localeId },
      )
      .where('product.id = :productId', { productId });

    return await query.getOne();
  }

  /**
   * Find the previous product down by price
   * @param findOptions find options
   * @returns product or undefined
   */

  async findPrevious(
    findOptions: FindOptionsWhere<Product> | FindOptionsWhere<Product>[],
  ) {
    const product = await this.findOneOrFail(findOptions);
    const previousProduct = await this.repository.findOne({
      where: { price: LessThan(product.price) },
      order: { price: SortOrder.DESC },
    });
    return previousProduct;
  }

  /**
   * Updates Product
   * @param dto data to update Product
   * @returns updated Product
   * @throws NotFoundException if Product not found
   */

  async update(dto: UpdateProductDto) {
    const { productId: id, localeContent, ...data } = dto;
    const { localeId } = localeContent;
    await this.findOneOrFail({ id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      if (data) {
        await manager.update(
          Product,
          { id },
          { ...data, updatedAt: new Date() },
        );
      }
      if (localeContent) {
        await manager.save(ProductLocaleContent, {
          ...localeContent,
          productId: id,
          updatedAt: new Date(),
        });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.productUpdateError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.productUpdateError);
    } finally {
      await queryRunner.release();
    }
    return await this.findOneWithContent({ productId: id, localeId });
  }

  /**
   * Removes Product
   * @param findOptions find options
   * @returns void
   * @throws NotFoundException if Product not found
   */

  async delete(findOptions: FindOptionsWhere<Product>) {
    const { id } = await this.findOneOrFail(findOptions);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { manager } = queryRunner;

    try {
      await manager.delete(ProductLocaleContent, { productId: id });
      await manager.delete(Product, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this._logger.error(`${errorMsgs.productDeleteError}
        Message: ${error.message}
        Stack: ${error.stack}`);
      throw new InternalServerErrorException(errorMsgs.productDeleteError);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get Product by amount. Transactional
   * @param data data to get product
   * @returns Product
   */

  async getProductByAmount({
    manager,
    amount,
  }: {
    manager: EntityManager;
    amount: number;
  }) {
    const { maxPrice }: { maxPrice: string } = await manager
      .createQueryBuilder()
      .from(Product, 'product')
      .select('MAX(product.price)', 'maxPrice')
      .getRawOne();
    if (amount >= +maxPrice) {
      return await manager.findOneByOrFail(Product, { price: +maxPrice });
    }
    const { price }: { price: string } = await manager
      .createQueryBuilder()
      .from(Product, 'product')
      .andWhere('product.price >= :amount', { amount })
      .select('MIN(product.price)', 'price')
      .getRawOne();
    return await manager.findOneByOrFail(Product, { price: +price });
  }
}
