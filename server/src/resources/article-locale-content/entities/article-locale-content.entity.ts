import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import {
  AVERAGE_LENGTH,
  LARGE_LENGTH,
  LONG_LENGTH,
} from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';
import { Article } from '../../articles/entities/article.entity';

@Entity('articleLocaleContent')
@Unique(['articleId', 'localeId'])
export class ArticleLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  articleId: string;

  @ManyToOne(() => Article, (article) => article.localeContent)
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.articlesLocaleContent)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: AVERAGE_LENGTH,
  })
  title: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: LARGE_LENGTH,
  })
  text: string;

  @ApiPropertyOptional()
  @Column({ type: 'character varying', nullable: true, length: LONG_LENGTH })
  videoLink: string | null;

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
}
