import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  NotContains,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsUserNotDeleted } from '../../../validation/is-user-not-deleted.validator';
import { AVERAGE_LENGTH } from '../../../utils/constants/common-constants';

export class AuthUpdateEmailDto {
  @ApiProperty({ example: 'email' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail({}, { message: `email:${errorMsgs.mustBeEmail}` })
  @NotContains(' ', { message: `email:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(AVERAGE_LENGTH, {
    message: `email:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  @IsNotEmpty({ message: `email:${errorMsgs.notEmptyField}` })
  @Validate(IsUserNotDeleted, {
    message: `email:${errorMsgs.userDeleted}`,
  })
  email: string;
}
