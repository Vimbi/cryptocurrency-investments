import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../../utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';

@Entity()
export class Role extends EntityHelper {
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

  @Column({ type: 'character varying', nullable: true, length: SHORT_LENGTH })
  displayName: string;
}
