import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsUserNotDeleted } from '../../../validation/is-user-not-deleted.validator';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthPhoneResendDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase().trim().replace(/[^\d]/g, ''))
  @Validate(IsUserNotDeleted, {
    message: `phone:${errorMsgs.userDeleted}`,
  })
  phone: string;
}
