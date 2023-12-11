import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Investment } from '../../investments/entities/investment.entity';
import { TransactionType } from '../../transaction-types/entities/transaction-type.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { ProductEarningsSetting } from '../../product-earnings-settings/entities/product-earnings-setting.entity';

@Entity('investmentTransaction')
export class InvestmentTransaction extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  investmentId: string;

  @ManyToOne(
    () => Investment,
    (investment) => investment.investmentTransactions,
  )
  @JoinColumn({ name: 'investmentId' })
  investment: Investment;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false })
  @Transform(({ value }) => convertCentsToDollars(value))
  amount: number;

  @Column({ type: 'uuid', nullable: false })
  typeId: string;

  @ApiProperty()
  @ManyToOne(() => TransactionType)
  @JoinColumn({ name: 'typeId' })
  type: TransactionType;

  @OneToOne(
    () => Transaction,
    (transaction) => transaction.investmentTransaction,
  )
  transaction: Transaction;

  @Column({ type: 'date', nullable: true })
  productEarningsSettingDate: Date;

  @Column({ type: 'uuid', nullable: true })
  productEarningsSettingProductId: string;

  @ManyToOne(() => ProductEarningsSetting)
  @JoinColumn([
    { name: 'productEarningsSettingDate', referencedColumnName: 'date' },
    {
      name: 'productEarningsSettingProductId',
      referencedColumnName: 'productId',
    },
  ])
  productEarningsSetting: ProductEarningsSetting;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
