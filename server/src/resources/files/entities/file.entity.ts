import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  AVERAGE_LENGTH,
  LONG_LENGTH,
  SHORT_LENGTH,
} from '../../../utils/constants/common-constants';
import { ArticleFile } from '../../article-files/entities/article-file.entity';
import { RaffleFile } from '../../raffle-files/entities/raffle-file.entity';

@Entity()
export class File extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'character varying', length: LONG_LENGTH, nullable: false })
  path: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: AVERAGE_LENGTH,
    nullable: false,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: AVERAGE_LENGTH,
    nullable: false,
  })
  displayName: string;

  @ApiProperty()
  @Column({ type: 'character varying', length: SHORT_LENGTH, nullable: false })
  extension: string;

  @ApiProperty()
  @Column({ type: 'character varying', length: LONG_LENGTH, nullable: false })
  key: string;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiProperty()
  @OneToMany(() => ArticleFile, (articleFile) => articleFile.file)
  articleFiles: ArticleFile[];

  @ApiProperty()
  @OneToMany(() => RaffleFile, (raffleFile) => raffleFile.file)
  raffleFiles: RaffleFile[];
}
