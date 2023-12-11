import { ApiProperty } from '@nestjs/swagger';
import { Validate, ValidateNested } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { TransactionType } from '../entities/transaction-type.entity';
import { Type } from 'class-transformer';
import { CreateTransactionTypeLocaleContentDto } from '../../transaction-types-locale-content/dto/create-transaction-type-locale-content.dto';
import { TransactionTypeEnum } from '../transaction-type.enum';

export class CreateTransactionTypeDto {
  @ApiProperty()
  @Validate(IsNotExist, [TransactionType.name, 'name'], {
    message: errorMsgs.transactionTypeNameExists,
  })
  name: TransactionTypeEnum;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateTransactionTypeLocaleContentDto)
  localeContent: CreateTransactionTypeLocaleContentDto;
}
