import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IProductCryptoCurrencyPrice } from '../../../types/products/product-cryptocurrency-price.interface';
import { Transform } from 'class-transformer';
import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { ProductEarningsSetting } from '../../product-earnings-settings/entities/product-earnings-setting.entity';
import { ProductLocaleContent } from '../../products-locale-content/entities/product-locale-content.entity';

@Entity('product')
export class Product extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    unique: true,
    nullable: false,
  })
  displayName: string;

  @Column({ type: 'integer', nullable: false })
  @Transform(({ value }) => convertCentsToDollars(value))
  price: number;

  cryptocurrencyPrices: IProductCryptoCurrencyPrice[] = [];

  @Column({ type: 'boolean', nullable: false, default: false })
  isProlongsInvestment: boolean;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date | null;

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date | null;

  @OneToMany(
    () => ProductEarningsSetting,
    (productEarningsSetting) => productEarningsSetting.product,
  )
  productEarningsSettings: ProductEarningsSetting[];

  @ApiProperty()
  @OneToMany(
    () => ProductLocaleContent,
    (localeContent) => localeContent.product,
  )
  localeContent: ProductLocaleContent[];
}
