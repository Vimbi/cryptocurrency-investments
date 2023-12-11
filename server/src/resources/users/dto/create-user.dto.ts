import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  NotContains,
  Validate,
} from 'class-validator';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { errorMsgs } from '../../../shared/error-messages';
import {
  AVERAGE_LENGTH,
  LONG_LENGTH,
  PASSWORD_REGEX,
  SHORT_LENGTH,
} from '../../../utils/constants/common-constants';
import { IsExist } from '../../../validation/is-exists.validator';

export class CreateUserDto {
  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: `email:${errorMsgs.mustBeEmail}` })
  @Validate(IsNotExist, ['User', 'email'], {
    message: `email:${errorMsgs.emailExists}`,
  })
  @MaxLength(AVERAGE_LENGTH, {
    message: `email:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  email: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, { message: errorMsgs.passwordMustMatch })
  @NotContains(' ', { message: `password:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(LONG_LENGTH, {
    message: `password:${errorMsgs.maxLengthField} ${LONG_LENGTH}`,
  })
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: `firstName:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `firstName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: `lastName:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `lastName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: `surname:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `surname:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  surname: string;

  @ApiProperty()
  @Validate(IsExist, ['Role', 'id'], {
    message: errorMsgs.roleNotExist,
  })
  roleId: string;

  @ApiProperty()
  @Validate(IsExist, ['UserStatus', 'id'], {
    message: errorMsgs.userStatusNotExist,
  })
  statusId: string;
}
