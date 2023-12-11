import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Validate } from 'class-validator';
import { IsUserNotDeleted } from '../../../validation/is-user-not-deleted.validator';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthForgotPasswordDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @Validate(IsUserNotDeleted, {
    message: `email:${errorMsgs.userDeleted}`,
  })
  email: string;
}
