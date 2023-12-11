import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../entities/locale.entity';
import { errorMsgs } from '../../../shared/error-messages';

export class DeleteLocaleDto {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'name'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;
}
