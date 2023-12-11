import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Transfer } from '../../transfers/entities/transfer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('transferCode')
export class TransferCode extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'character varying', nullable: false })
  code: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  transferId: string | null;

  @ManyToOne(() => Transfer)
  @JoinColumn({ name: 'transferId' })
  transfer: Transfer;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
