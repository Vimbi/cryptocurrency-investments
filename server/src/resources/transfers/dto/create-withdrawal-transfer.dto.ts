import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  Allow,
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
import { ICreateWithdrawalTransfer } from '../../../types/transfers/create-withdrawal-transfer.interface';

export class CreateWithdrawalTransferDto
  implements Omit<ICreateWithdrawalTransfer, 'userId'>
{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

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

  @ApiHideProperty()
  @Allow()
  typeId: string;

  @ApiHideProperty()
  @Allow()
  statusId: string;
}
