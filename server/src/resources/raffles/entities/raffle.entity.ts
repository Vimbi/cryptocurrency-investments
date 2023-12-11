import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RaffleFile } from '../../raffle-files/entities/raffle-file.entity';
import { RaffleLocaleContent } from '../../raffles-local-content/entities/raffle-locale-content.entity';

@Entity()
export class Raffle extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: false })
  startDate: Date;

  @ApiProperty()
  @Column({ type: 'timestamp with time zone', nullable: false })
  endDate: Date;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: false, default: false })
  isPublished: boolean;

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
  @OneToMany(() => RaffleFile, (raffleFile) => raffleFile.raffle)
  files: RaffleFile[];

  @ApiProperty()
  @OneToMany(() => RaffleLocaleContent, (localeContent) => localeContent.raffle)
  localeContent: RaffleLocaleContent[];
}
