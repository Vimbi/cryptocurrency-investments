import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  AVERAGE_LENGTH,
  LARGE_LENGTH,
} from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';
import { Raffle } from '../../raffles/entities/raffle.entity';

@Entity('raffleLocaleContent')
@Unique(['raffleId', 'localeId'])
export class RaffleLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  raffleId: string;

  @ManyToOne(() => Raffle, (raffle) => raffle.localeContent)
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.rafflesLocaleContent)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: AVERAGE_LENGTH,
    nullable: false,
  })
  title: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: LARGE_LENGTH,
    nullable: false,
  })
  description: string;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;
}
