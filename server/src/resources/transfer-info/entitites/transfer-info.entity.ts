import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { Transfer } from '../../transfers/entities/transfer.entity';
import { LONG_LENGTH } from '../../../utils/constants/common-constants';

@Entity('transferInfo')
export class TransferInfo extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false, unique: true })
  transferId: string;

  @OneToOne(() => Transfer, (transfer) => transfer.info)
  @JoinColumn({ name: 'transferId' })
  transfer: Transfer;

  @Column({ type: 'integer', nullable: false, default: 0 })
  attempts: number;

  @Column({
    type: 'character varying',
    array: true,
    nullable: true,
    length: LONG_LENGTH,
  })
  errorMessages: string[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date | null;
}
