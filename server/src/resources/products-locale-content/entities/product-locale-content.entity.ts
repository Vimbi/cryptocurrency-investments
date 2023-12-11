import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { AVERAGE_LENGTH } from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('productLocaleContent')
@Unique(['productId', 'localeId'])
export class ProductLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  productId: string;

  @ManyToOne(() => Product, (product) => product.localeContent)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.productsLocaleContent)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @Column({
    array: true,
    type: 'character varying',
    nullable: false,
    length: AVERAGE_LENGTH,
  })
  features: string[];

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;
}
