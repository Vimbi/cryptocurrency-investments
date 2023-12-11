import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';
import { TransactionType } from '../../transaction-types/entities/transaction-type.entity';

@Entity('transactionTypeLocaleContent')
@Unique(['typeId', 'localeId'])
export class TransactionTypeLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  typeId: string;

  @ManyToOne(() => TransactionType, (type) => type.localeContent)
  @JoinColumn({ name: 'typeId' })
  type: TransactionType;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.transactionTypesLocaleContent)
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

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date | null;
}
