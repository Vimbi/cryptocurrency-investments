import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  MAX_DECIMAL_PLACES_CURRENCY,
  MAX_NUMBER_DIGITS_CURRENCY,
} from '../../../utils/constants/common-constants';
import { Network } from '../../networks/entities/network.entity';

@Entity('fixedCurrencyRate')
export class FixedCurrencyRate extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  networkId: string;

  @ManyToOne(() => Network, (network) => network.fixedCurrencyRates)
  @JoinColumn({ name: 'networkId' })
  network: Network;

  @Column({
    type: 'decimal',
    precision: MAX_NUMBER_DIGITS_CURRENCY,
    scale: MAX_DECIMAL_PLACES_CURRENCY,
    nullable: false,
  })
  rate: number;

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
  endedAt: Date | null;
}
