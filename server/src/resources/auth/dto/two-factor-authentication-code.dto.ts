import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { CODE_LENGTH } from '../../../utils/constants/common-constants';

export class TwoFactorAuthenticationCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({
    message: `twoFactorAuthenticationCode:${errorMsgs.notEmptyField}`,
  })
  @MaxLength(CODE_LENGTH, {
    message: `twoFactorAuthenticationCode:${errorMsgs.maxLengthField} ${CODE_LENGTH}`,
  })
  twoFactorAuthenticationCode: string;
}
