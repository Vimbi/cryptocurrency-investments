import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { TransferType } from '../entities/transfer-type.entity';

export class UpdateTransferTypeDto {
  @ApiProperty()
  @Validate(IsNotExist, [TransferType.name, 'displayName'], {
    message: errorMsgs.transferTypeDisplayNameExists,
  })
  displayName: string;
}
