import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { Locale } from '../entities/locale.entity';
import { errorMsgs } from '../../../shared/error-messages';

export class CreateLocaleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(SHORT_LENGTH)
  @Validate(IsNotExist, [Locale.name, 'name'], {
    message: errorMsgs.localeNameExists,
  })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(SHORT_LENGTH)
  @Validate(IsNotExist, [Locale.name, 'name'], {
    message: errorMsgs.localeDisplayNameExists,
  })
  displayName: string;
}
