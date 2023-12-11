import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsUserNotDeleted } from '../../../validation/is-user-not-deleted.validator';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthLoginDto {
  @ApiProperty()
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsNotEmpty({ message: `email:${errorMsgs.notEmptyField}` })
  @Validate(IsUserNotDeleted, {
    message: `email:${errorMsgs.userDeleted}`,
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: `password:${errorMsgs.notEmptyField}` })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: `recaptchaToken:${errorMsgs.notEmptyField}` })
  recaptchaToken: string;
}
