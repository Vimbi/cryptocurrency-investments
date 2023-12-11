import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Transform } from 'class-transformer';
import { convertCentsToDollars } from '../../../utils/convert-cents-to-dollars';
import {
  LONG_LENGTH,
  MAX_DECIMAL_PLACES_CURRENCY,
  MAX_NUMBER_DIGITS_CURRENCY,
  SHORT_LENGTH,
} from '../../../utils/constants/common-constants';
import { TransferStatus } from '../../transfer-statuses/entities/transfer-status.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransferType } from '../../transfer-types/entities/transfer-type.entity';
import { Network } from '../../networks/entities/network.entity';
import { TransferInfo } from '../../transfer-info/entitites/transfer-info.entity';

@Entity()
export class Transfer extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: false })
  networkId: string;

  @ManyToOne(() => Network, (network) => network.transfers)
  @JoinColumn({ name: 'networkId' })
  network: Network;

  @Column({
    type: 'decimal',
    precision: MAX_NUMBER_DIGITS_CURRENCY,
    scale: MAX_DECIMAL_PLACES_CURRENCY,
    nullable: false,
  })
  currencyAmount: number;

  @Column({ type: 'integer', nullable: false })
  @Transform(({ value }) => convertCentsToDollars(value))
  amount: number;

  @Column({ type: 'uuid', nullable: false })
  typeId: string;

  @ManyToOne(() => TransferType)
  @JoinColumn({ name: 'typeId' })
  type: TransferType;

  @Column({ type: 'uuid', nullable: false })
  statusId: string;

  @ManyToOne(() => TransferStatus)
  @JoinColumn({ name: 'statusId' })
  status: TransferStatus;

  @Column({ type: 'character varying', nullable: true, length: SHORT_LENGTH })
  txId: string | null;

  @Column({ type: 'character varying', nullable: true, length: SHORT_LENGTH })
  fromAddress: string | null;

  @Column({ type: 'character varying', nullable: true, length: SHORT_LENGTH })
  withdrawalAddress: string | null;

  @Column({ type: 'character varying', nullable: true, length: LONG_LENGTH })
  note: string | null;

  @OneToOne(() => Transaction, (transaction) => transaction.transfer)
  transaction: Transaction;

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
  endedAt: Date | null;

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt: Date | null;

  @OneToOne(() => TransferInfo, (info) => info.transfer)
  info: TransferInfo;

  @Column({ type: 'uuid', nullable: false })
  duplicateStatusId: string;

  @ManyToOne(() => TransferStatus)
  @JoinColumn({ name: 'duplicateStatusId' })
  duplicateStatus: TransferStatus;
}
