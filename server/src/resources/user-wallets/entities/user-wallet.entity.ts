import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { User } from '../../users/entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Network } from '../../networks/entities/network.entity';

@Entity('userWallet')
export class UserWallet extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: false })
  networkId: string;

  @ManyToOne(() => Network, (network) => network.userWallets)
  @JoinColumn({ name: 'networkId' })
  network: Network;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  address: string;

  @ApiPropertyOptional()
  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: true,
  })
  note: string | null;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
