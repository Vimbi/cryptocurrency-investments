import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  MaxLength,
  NotContains,
  Validate,
  ValidateNested,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { ArticleType } from '../entities/article-type.entity';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { CreateArticleTypeLocaleContentDto } from '../../article-type-locale-content/dto/create-article-type-locale-content.dto';
import { Type } from 'class-transformer';

export class CreateArticleTypeDto {
  @ApiProperty()
  @MaxLength(SHORT_LENGTH)
  @IsNotEmpty()
  @NotContains(' ')
  @Validate(IsNotExist, [ArticleType.name, 'name'], {
    message: errorMsgs.articleTypeNameExists,
  })
  name: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleTypeLocaleContentDto)
  localeContent: CreateArticleTypeLocaleContentDto[];
}
