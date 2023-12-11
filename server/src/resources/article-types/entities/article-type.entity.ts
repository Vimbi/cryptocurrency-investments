import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { ArticleTypeLocaleContent } from '../../article-type-locale-content/entities/article-type-locale-content.entity';

@Entity('articleType')
export class ArticleType extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
    unique: true,
  })
  name: string;

  @ApiProperty()
  @OneToMany(
    () => ArticleTypeLocaleContent,
    (articleTypeLocaleContent) => articleTypeLocaleContent.type,
  )
  localeContent: ArticleTypeLocaleContent[];

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
