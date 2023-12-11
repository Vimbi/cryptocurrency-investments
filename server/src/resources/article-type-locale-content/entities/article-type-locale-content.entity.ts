import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { Locale } from '../../locales/entities/locale.entity';
import { ArticleType } from '../../article-types/entities/article-type.entity';

@Entity('articleTypeLocaleContent')
@Unique(['typeId', 'localeId'])
export class ArticleTypeLocaleContent extends EntityHelper {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  typeId: string;

  @ManyToOne(() => ArticleType, (articleType) => articleType.localeContent)
  @JoinColumn({ name: 'typeId' })
  type: ArticleType;

  @PrimaryColumn({ type: 'uuid', nullable: false })
  localeId: string;

  @ManyToOne(() => Locale, (locale) => locale.articleTypesLocaleContent)
  @JoinColumn({ name: 'localeId' })
  locale: Locale;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  displayName: string;

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
}
