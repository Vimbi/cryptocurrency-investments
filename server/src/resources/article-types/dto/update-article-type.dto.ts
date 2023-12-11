import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  NotContains,
  Validate,
  ValidateNested,
} from 'class-validator';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { ArticleType } from '../entities/article-type.entity';
import { errorMsgs } from '../../../shared/error-messages';
import { UpdateArticleTypeLocaleContentDto } from '../../article-type-locale-content/dto/update-article-type-locale-content.dto';
import { Type } from 'class-transformer';

export class UpdateArticleTypeDto {
  @ApiPropertyOptional()
  @MaxLength(SHORT_LENGTH)
  @IsNotEmpty()
  @NotContains(' ')
  @Validate(IsNotExist, [ArticleType.name, 'name'], {
    message: errorMsgs.articleTypeNameExists,
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateArticleTypeLocaleContentDto)
  @IsOptional()
  localeContent?: UpdateArticleTypeLocaleContentDto[];
}
