import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRaffleLocaleContentDto } from './create-raffle-locale-content.dto';
import { Validate } from 'class-validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../../locales/entities/locale.entity';
import { errorMsgs } from '../../../shared/error-messages';

export class UpdateRaffleLocaleContentDto extends PartialType(
  CreateRaffleLocaleContentDto,
) {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'id'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;
}
