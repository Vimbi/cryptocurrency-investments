import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { ArticleType } from '../../article-types/entities/article-type.entity';
import { ArticleFile } from '../../article-files/entities/article-file.entity';
import { ArticleLocaleContent } from '../../article-locale-content/entities/article-locale-content.entity';

@Entity()
export class Article extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'boolean', nullable: false, default: false })
  isPublished: boolean;

  @Column({ type: 'uuid', nullable: false })
  typeId: string;

  @ManyToOne(() => ArticleType)
  @JoinColumn({ name: 'typeId' })
  type: ArticleType;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @ApiProperty()
  @OneToMany(() => ArticleFile, (articleFile) => articleFile.article)
  articleFiles: ArticleFile[];

  @ApiProperty()
  @OneToMany(
    () => ArticleLocaleContent,
    (articleLocaleContent) => articleLocaleContent.article,
  )
  localeContent: ArticleLocaleContent[];
}
