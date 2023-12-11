import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { Currency } from '../../currencies/entities/currency.entity';
import { Network } from '../entities/network.entity';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';

export class CreateNetworkDto {
  @ApiProperty()
  @Validate(IsExist, [Currency.name, 'id'], {
    message: errorMsgs.currencyNotFound,
  })
  currencyId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_LENGTH, {
    message: `displayName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  displayName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_LENGTH, {
    message: `displayName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  description: string;

  @ApiProperty()
  @Validate(IsNotExist, [Network.name, 'depositAddress'], {
    message: errorMsgs.networkDepositAddressExists,
  })
  @MaxLength(SHORT_LENGTH, {
    message: `displayName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  depositAddress: string;
}
