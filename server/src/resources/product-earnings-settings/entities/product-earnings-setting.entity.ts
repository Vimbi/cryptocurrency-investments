import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Product } from '../../products/entities/product.entity';
import { Transform } from 'class-transformer';
import { convertNumberToPercentage } from '../../../utils/convert-number-to-percentage';

@Entity('productEarningsSetting')
export class ProductEarningsSetting extends EntityHelper {
  @PrimaryColumn({ type: 'date', nullable: false })
  date: Date;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  productId: string;

  @ManyToOne(() => Product, (product) => product.productEarningsSettings)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'integer', nullable: false })
  @Transform(({ value }) => convertNumberToPercentage(value))
  percentage: number;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date | null;
}
