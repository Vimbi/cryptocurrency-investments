import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import {
  MAX_DECIMAL_PLACES,
  MAX_DECIMAL_PLACES_CURRENCY,
} from '../../../utils/constants/common-constants';
import { IsValidRate } from '../../../validation/is-valid-rate.validator';

export class CalculateAmountDto {
  @ApiProperty()
  @Validate(IsValidRate, {
    message: errorMsgs.fixedCurrencyRateNotFound,
  })
  fixedCurrencyRateId: string;

  @ApiPropertyOptional()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: MAX_DECIMAL_PLACES,
  })
  @IsPositive({ message: `amount:${errorMsgs.mustBePositiveNumber}` })
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: MAX_DECIMAL_PLACES_CURRENCY,
  })
  @IsPositive({ message: `currencyAmount:${errorMsgs.mustBePositiveNumber}` })
  @IsOptional()
  currencyAmount?: number;
}
