import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { errorMsgs } from '../../../shared/error-messages';
import { ArticleType } from '../../article-types/entities/article-type.entity';
import { Type } from 'class-transformer';
import { CreateArticleLocaleContentDto } from '../../article-locale-content/dto/create-article-locale-content.dto';

export class CreateArticleDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty()
  @Validate(IsExist, [ArticleType.name, 'id'], {
    message: errorMsgs.articleTypeNotFound,
  })
  typeId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateArticleLocaleContentDto)
  localeContent: CreateArticleLocaleContentDto;
}
