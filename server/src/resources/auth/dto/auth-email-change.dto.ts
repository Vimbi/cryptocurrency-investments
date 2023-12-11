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
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { AVERAGE_LENGTH } from '../../../utils/constants/common-constants';

export class AuthEmailChangeDto {
  @ApiProperty({ example: 'email' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail({}, { message: `email:${errorMsgs.mustBePhoneNumber}` })
  @Validate(IsNotExist, ['User', 'email'], {
    message: `email:${errorMsgs.userExists}`,
  })
  @NotContains(' ', { message: `email:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(AVERAGE_LENGTH, {
    message: `email:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  @IsNotEmpty({ message: `email:${errorMsgs.notEmptyField}` })
  email: string;
}
