import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';

export class AuthConfirmPhoneDto {
  @ApiProperty()
  @IsNotEmpty({ message: `code:${errorMsgs.notEmptyField}` })
  code: string;

  @ApiProperty()
  @IsNotEmpty({ message: `userId:${errorMsgs.notEmptyField}` })
  userId: string;
}
