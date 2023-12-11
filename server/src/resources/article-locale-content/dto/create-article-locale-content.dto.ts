import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import {
  AVERAGE_LENGTH,
  FILES_NUMBER_LIMIT,
  LARGE_LENGTH,
  LONG_LENGTH,
} from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';
import { CreateArticleFileDto } from '../../articles/dto/create-article-file.dto';
import { Type } from 'class-transformer';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../../locales/entities/locale.entity';

export class CreateArticleLocaleContentDto {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'id'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AVERAGE_LENGTH)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(LARGE_LENGTH)
  text: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(LONG_LENGTH)
  @IsOptional()
  videoLink?: string;

  @ApiPropertyOptional()
  @ArrayMaxSize(FILES_NUMBER_LIMIT, {
    message: `files:${errorMsgs.maxQuantity} ${FILES_NUMBER_LIMIT}`,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateArticleFileDto)
  @IsOptional()
  files?: CreateArticleFileDto[];
}
