import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, NotContains } from 'class-validator';
import {
  LONG_LENGTH,
  PASSWORD_REGEX,
} from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthResetPasswordDto {
  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: `password:${errorMsgs.passwordMustMatch}`,
  })
  @NotContains(' ', { message: `password:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(LONG_LENGTH, {
    message: `password:${errorMsgs.maxLengthField} ${LONG_LENGTH}`,
  })
  @IsNotEmpty({ message: `password:${errorMsgs.notEmptyField}` })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
