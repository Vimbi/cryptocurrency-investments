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
import { TransferType } from '../../transfer-types/entities/transfer-type.entity';

@Entity('transferTypeLocaleContent')
@Unique(['typeId', 'localeId'])
export class TransferTypeLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  typeId: string;

  @ManyToOne(() => TransferType, (type) => type.localeContent)
  @JoinColumn({ name: 'typeId' })
  type: TransferType;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.transferTypesLocaleContent)
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
