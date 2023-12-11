import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';
import { TransferStatus } from '../../transfer-statuses/entities/transfer-status.entity';

@Entity('transferStatusLocaleContent')
@Unique(['statusId', 'localeId'])
export class TransferStatusLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  statusId: string;

  @ManyToOne(() => TransferStatus, (status) => status.localeContent)
  @JoinColumn({ name: 'statusId' })
  status: TransferStatus;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.transferStatusesLocaleContent)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  displayName: string;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
