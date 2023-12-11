import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { TransactionTypeLocaleContent } from '../../transaction-types-locale-content/entities/transaction-type-locale-content.entity';
import { TransactionTypeEnum } from '../transaction-type.enum';

@Entity('transactionType')
export class TransactionType extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'character varying', length: SHORT_LENGTH, nullable: false })
  name: TransactionTypeEnum;

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

  @ApiProperty()
  @OneToMany(
    () => TransactionTypeLocaleContent,
    (localeContent) => localeContent.type,
  )
  localeContent: TransactionTypeLocaleContent[];
}
