import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Network } from '../../networks/entities/network.entity';

@Entity()
export class Currency extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    unique: true,
    nullable: false,
  })
  displayName: string;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    unique: true,
    nullable: false,
  })
  symbol: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  isSenderAddressRequired: boolean;

  rate: number;

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

  @ApiHideProperty()
  @OneToMany(() => Network, (network) => network.currency)
  networks: Network[];
}
