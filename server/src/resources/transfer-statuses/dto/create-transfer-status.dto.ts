import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { TransferStatus } from '../entities/transfer-status.entity';

export class CreateTransferStatusDto {
  @ApiProperty()
  @Validate(IsNotExist, [TransferStatus.name, 'name'], {
    message: errorMsgs.transferStatusNameExists,
  })
  name: string;

  @ApiProperty()
  @Validate(IsNotExist, [TransferStatus.name, 'displayName'], {
    message: errorMsgs.transferStatusDisplayNameExists,
  })
  displayName: string;
}
