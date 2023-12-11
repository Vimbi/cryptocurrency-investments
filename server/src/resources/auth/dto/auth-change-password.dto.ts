import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, NotContains } from 'class-validator';
import {
  LONG_LENGTH,
  PASSWORD_REGEX,
} from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: `oldPassword:${errorMsgs.notEmptyField}` })
  oldPassword: string;

  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message: `newPassword:${errorMsgs.passwordMustMatch}`,
  })
  @NotContains(' ', { message: `newPassword:${errorMsgs.noWhiteSpaces}` })
  @MaxLength(LONG_LENGTH, {
    message: `newPassword:${errorMsgs.maxLengthField} ${LONG_LENGTH}`,
  })
  @IsNotEmpty({ message: `newPassword:${errorMsgs.notEmptyField}` })
  newPassword: string;
}
