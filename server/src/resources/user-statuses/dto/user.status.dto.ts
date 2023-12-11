import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';

export class UserStatusDto {
  @ApiProperty()
  @Validate(IsNotExist, ['UserStatus', 'name'], {
    message: errorMsgs.userStatusNameExists,
  })
  name: string;

  @ApiProperty()
  @Validate(IsNotExist, ['UserStatus', 'name'], {
    message: errorMsgs.userStatusNameExists,
  })
  displayName: string;
}
