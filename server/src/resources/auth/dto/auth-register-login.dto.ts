import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  NotContains,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { errorMsgs } from '../../../shared/error-messages';
import {
  AVERAGE_LENGTH,
  LONG_LENGTH,
  PASSWORD_REGEX,
  SHORT_LENGTH,
} from '../../../utils/constants/common-constants';
import { IsExist } from '../../../validation/is-exists.validator';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { User } from '../../users/entities/user.entity';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'email' })
  @Transform(({ value }) => value.toLowerCase().trim())
  @IsEmail({}, { message: `email:${errorMsgs.mustBeEmail}` })
  @NotContains(' ', { message: `email:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(AVERAGE_LENGTH, {
    message: `email:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  @IsNotEmpty({ message: `email:${errorMsgs.notEmptyField}` })
  @Validate(IsNotExist, [User.name, 'email'], {
    message: `email:${errorMsgs.emailExists}`,
  })
  email: string;

  @ApiProperty()
  @NotContains(' ', { message: `password:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(LONG_LENGTH, {
    message: `password:${errorMsgs.maxLengthField} ${LONG_LENGTH}`,
  })
  @IsNotEmpty({ message: `password:${errorMsgs.notEmptyField}` })
  @Matches(PASSWORD_REGEX, {
    message: `password:${errorMsgs.passwordMustMatch}`,
  })
  password: string;

  @ApiProperty()
  @IsString({ message: `firstName:${errorMsgs.mustBeString}` })
  @IsNotEmpty({ message: `firstName:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `firstName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  firstName: string;

  @ApiProperty()
  @IsString({ message: `lastName:${errorMsgs.mustBeString}` })
  @IsNotEmpty({ message: `lastName:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `lastName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  lastName: string;

  @ApiProperty()
  @IsString({ message: `surname:${errorMsgs.mustBeString}` })
  @IsNotEmpty({ message: `surname:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `surname:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  @IsOptional()
  surname?: string;

  @ApiProperty()
  @Validate(IsExist, ['User', 'referralCode'], {
    message: `referralCode:${errorMsgs.userNotFound}`,
  })
  referralCode: string;
}
