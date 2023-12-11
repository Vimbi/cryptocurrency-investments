import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { User } from '../../users/entities/user.entity';

@Unique(['userId', 'date'])
@Entity('accountStatement')
export class AccountStatement extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'integer', nullable: false })
  closingBalance: number;

  @Column({ type: 'integer', nullable: false })
  totalIncome: number;

  @Column({ type: 'integer', nullable: false })
  totalConsumption: number;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
