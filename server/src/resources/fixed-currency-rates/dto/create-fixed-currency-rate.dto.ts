import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsExist } from '../../../validation/is-exists.validator';
import { Network } from '../../networks/entities/network.entity';

export class CreateFixedCurrencyRateDto {
  @ApiProperty()
  @Validate(IsExist, [Network.name, 'id'], {
    message: errorMsgs.networkNotFound,
  })
  networkId: string;
}
