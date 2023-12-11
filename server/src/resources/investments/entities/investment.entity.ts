import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { User } from '../../users/entities/user.entity';
import { InvestmentTransaction } from '../../investments-transactions/entities/investment-transaction.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Investment extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.investments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @ApiProperty()
  @Column({ type: 'date', nullable: false })
  dueDate: Date;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false })
  @Transform(({ value }) => convertCentsToDollars(value))
  amount: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false, default: 0 })
  @Transform(({ value }) => convertCentsToDollars(value))
  income: number;

  @ApiProperty()
  @Column({ type: 'integer', nullable: false, default: 0 })
  @Transform(({ value }) => convertCentsToDollars(value))
  fine: number;

  @Column({ type: 'uuid', nullable: false })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

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
  completedAt: Date | null;

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  canceledAt: Date | null;

  @ApiProperty()
  @OneToMany(
    () => InvestmentTransaction,
    (investmentTransaction) => investmentTransaction.investment,
  )
  investmentTransactions: InvestmentTransaction[];

  @ApiProperty()
  @OneToMany(() => Transaction, (transaction) => transaction.investment)
  transactions: Transaction[];
}
