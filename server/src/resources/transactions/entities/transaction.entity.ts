import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { TransactionType } from '../../transaction-types/entities/transaction-type.entity';
import { Transform } from 'class-transformer';
import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import { Transfer } from '../../transfers/entities/transfer.entity';
import { InvestmentTransaction } from '../../investments-transactions/entities/investment-transaction.entity';
import { Investment } from '../../investments/entities/investment.entity';

@Entity()
export class Transaction extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

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

  @Column({ type: 'uuid', nullable: true })
  transferId: string | null;

  @OneToOne(() => Transfer, (transfer) => transfer.transaction)
  @JoinColumn({ name: 'transferId' })
  transfer: Transfer;

  @Column({ type: 'uuid', nullable: true })
  investmentId: string | null;

  @ManyToOne(() => Investment, (investment) => investment.transactions)
  @JoinColumn({ name: 'investmentId' })
  investment: Investment;

  @Column({ type: 'uuid', nullable: true })
  investmentTransactionId: string | null;

  @OneToOne(
    () => InvestmentTransaction,
    (investmentTransaction) => investmentTransaction.transaction,
  )
  @JoinColumn({ name: 'investmentTransactionId' })
  investmentTransaction: InvestmentTransaction;

  @Column({ type: 'uuid', nullable: true })
  originTransactionId: string | null;

  @OneToOne(
    () => Transaction,
    (originTransaction) => originTransaction.receiptTransaction,
  )
  @JoinColumn({ name: 'originTransactionId' })
  originTransaction: Transaction;

  @OneToOne(
    () => Transaction,
    (receiptTransaction) => receiptTransaction.originTransaction,
  )
  receiptTransaction: Transaction;

  @Column({ type: 'integer', nullable: true })
  referralLevelPercentage: number | null;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
