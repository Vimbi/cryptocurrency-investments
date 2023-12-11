import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateArticleLocaleContentDto } from './create-article-locale-content.dto';
import { Validate } from 'class-validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../../locales/entities/locale.entity';
import { errorMsgs } from '../../../shared/error-messages';

export class UpdateArticleLocaleContentDto extends PartialType(
  CreateArticleLocaleContentDto,
) {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'id'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;
}
