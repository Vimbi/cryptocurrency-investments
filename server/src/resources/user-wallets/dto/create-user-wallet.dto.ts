import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  NotContains,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsExist } from '../../../validation/is-exists.validator';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { ICreateUserWallet } from '../../../types/user-wallet/create-user-wallet.interface';
import { Transform } from 'class-transformer';
import { Network } from '../../networks/entities/network.entity';

export class CreateUserWalletDto implements Omit<ICreateUserWallet, 'userId'> {
  @ApiProperty()
  @Validate(IsExist, [Network.name, 'id'], {
    message: errorMsgs.networkNotFound,
  })
  networkId: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: `address:${errorMsgs.notEmptyField}` })
  @NotContains(' ', { message: `address:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(SHORT_LENGTH, {
    message: `address:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  address: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_LENGTH, {
    message: `note:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  @IsOptional()
  note?: string;
}
