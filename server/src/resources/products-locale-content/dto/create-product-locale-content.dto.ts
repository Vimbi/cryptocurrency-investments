import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, MaxLength, Validate } from 'class-validator';
import { AVERAGE_LENGTH } from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../../locales/entities/locale.entity';

export class CreateProductLocaleContentDto {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'id'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(AVERAGE_LENGTH, { each: true })
  features: string[];
}
