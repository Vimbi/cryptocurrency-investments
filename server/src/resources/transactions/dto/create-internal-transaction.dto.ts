import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { Transform } from 'class-transformer';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';
import { IsExist } from '../../../validation/is-exists.validator';
import { User } from '../../users/entities/user.entity';
import { ICreateInternalTransaction } from '../../../types/transactions/create-internal-transaction.interface';

export class CreateInternalTransactionDto
  implements Omit<ICreateInternalTransaction, 'fromUserId'>
{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsInt()
  @IsPositive({ message: `amount:${errorMsgs.mustBePositiveNumber}` })
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  amount: number;

  @ApiProperty()
  @Validate(IsExist, [User.name, 'id'], {
    message: errorMsgs.userNotFound,
  })
  toUserId: string;
}
