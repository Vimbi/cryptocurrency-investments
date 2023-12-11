import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  NotContains,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsValidRate } from '../../../validation/is-valid-rate.validator';
import { Transform } from 'class-transformer';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';
import { ISendWithdrawalCode } from '../../../types/transfers/send-withdrawal-code.interface';

export class SendWithdrawalCodeDto
  implements Omit<ISendWithdrawalCode, 'userId'>
{
  @ApiProperty()
  @Validate(IsValidRate, {
    message: errorMsgs.fixedCurrencyRateNotFound,
  })
  fixedCurrencyRateId: string;

  @ApiProperty()
  @IsInt()
  @IsPositive({ message: `amount:${errorMsgs.mustBePositiveNumber}` })
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: `withdrawalAddress:${errorMsgs.notEmptyField}` })
  @NotContains(' ', { message: `withdrawalAddress:${errorMsgs.noWhiteSpaces}` })
  withdrawalAddress: string;
}
