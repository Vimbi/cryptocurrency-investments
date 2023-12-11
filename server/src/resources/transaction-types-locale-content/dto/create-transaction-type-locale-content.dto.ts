import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../../locales/entities/locale.entity';

export class CreateTransactionTypeLocaleContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_LENGTH)
  @IsNotEmpty()
  displayName: string;

  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'id'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;
}
