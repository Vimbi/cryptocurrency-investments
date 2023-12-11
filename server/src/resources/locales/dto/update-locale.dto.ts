import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLocaleDto } from './create-locale.dto';
import { Validate } from 'class-validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../entities/locale.entity';
import { errorMsgs } from '../../../shared/error-messages';

export class UpdateLocaleDto extends PartialType(CreateLocaleDto) {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'name'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;
}
