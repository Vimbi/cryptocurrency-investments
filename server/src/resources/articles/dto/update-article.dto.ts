import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateArticleLocaleContentDto } from '../../article-locale-content/dto/update-article-locale-content.dto';

export class UpdateArticleDto extends PartialType(
  OmitType(CreateArticleDto, ['localeContent']),
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  articleId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateArticleLocaleContentDto)
  @IsOptional()
  localeContent?: UpdateArticleLocaleContentDto;
}
