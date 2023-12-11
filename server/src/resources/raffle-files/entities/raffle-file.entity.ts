import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { File } from '../../files/entities/file.entity';
import { Raffle } from '../../raffles/entities/raffle.entity';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';

@Entity('raffleFile')
@Unique(['fileId', 'raffleId'])
export class RaffleFile extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  raffleId: string;

  @ManyToOne(() => Raffle)
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  fileId: string;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ApiProperty()
  @Column({ type: 'character varying', nullable: false, length: SHORT_LENGTH })
  theme: string;

  @Column({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.raffleFiles)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
