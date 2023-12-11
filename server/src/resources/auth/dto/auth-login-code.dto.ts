import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsUserNotDeleted } from '../../../validation/is-user-not-deleted.validator';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthLoginCodeDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase().trim().replace(/[^\d]/g, ''))
  @IsNotEmpty({ message: `phone:${errorMsgs.notEmptyField}` })
  @Validate(IsUserNotDeleted, {
    message: `phone:${errorMsgs.userDeleted}`,
  })
  phone: string;
}
