import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';

export class CreateCurrencyDto {
  @ApiProperty()
  @Validate(IsNotExist, ['Currency', 'displayName'], {
    message: errorMsgs.currencyDisplayNameExists,
  })
  displayName: string;

  @ApiProperty()
  @Validate(IsNotExist, ['Currency', 'symbol'], {
    message: errorMsgs.currencySymbolExists,
  })
  symbol: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSenderAddressRequired?: boolean;
}
