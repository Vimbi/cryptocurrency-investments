import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { File } from '../../files/entities/file.entity';
import { Article } from '../../articles/entities/article.entity';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';

@Entity('articleFile')
@Unique(['fileId', 'articleId', 'localeId'])
@Unique(['fileId', 'articleId', 'theme'])
export class ArticleFile extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  articleId: string;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  fileId: string;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ApiProperty()
  @Column({ type: 'character varying', nullable: true, length: SHORT_LENGTH })
  theme: string | null;

  @Column({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.articleFiles)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;
}
