import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from 'src/utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { TransferTypeLocaleContent } from '../../transfer-types-locale-content/entities/transfer-type-locale-content.entity';

@Entity('transferType')
export class TransferType extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: SHORT_LENGTH,
    unique: true,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: SHORT_LENGTH,
    unique: true,
  })
  displayName: string;

  @ApiProperty()
  @OneToMany(
    () => TransferTypeLocaleContent,
    (localeContent) => localeContent.type,
  )
  localeContent: TransferTypeLocaleContent[];
}
