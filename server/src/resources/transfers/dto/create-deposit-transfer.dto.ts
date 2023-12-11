import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Allow,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  NotContains,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsValidRate } from '../../../validation/is-valid-rate.validator';
import { Transform } from 'class-transformer';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';
import { ICreateTransfer } from '../../../types/transfers/create-transfer.interface';

export class CreateDepositTransferDto
  implements Omit<ICreateTransfer, 'userId'>
{
  @ApiProperty()
  @Validate(IsValidRate, {
    message: errorMsgs.fixedCurrencyRateNotFound,
  })
  fixedCurrencyRateId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty({ message: `fromAddress:${errorMsgs.notEmptyField}` })
  @NotContains(' ', { message: `fromAddress:${errorMsgs.noWhiteSpaces}` })
  @IsOptional()
  fromAddress?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive({ message: `amount:${errorMsgs.mustBePositiveNumber}` })
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  amount: number;

  @ApiHideProperty()
  @Allow()
  typeId: string;

  @ApiHideProperty()
  @Allow()
  statusId: string;
}
