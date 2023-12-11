import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  AVERAGE_LENGTH,
  LONG_LENGTH,
  SHORT_LENGTH,
} from '../../../utils/constants/common-constants';

@Entity('officeOpeningRequest')
export class OfficeOpeningRequest extends EntityHelper {
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
  phone: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: AVERAGE_LENGTH,
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: AVERAGE_LENGTH,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: AVERAGE_LENGTH,
  })
  surname: string;

  @ApiPropertyOptional()
  @Column({
    type: 'character varying',
    nullable: true,
    length: LONG_LENGTH,
  })
  note: string | null;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  notifiedAt: Date;
}
