import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  HELPDESK_MESSAGE_LENGTH,
  SHORT_LENGTH,
} from '../../../utils/constants/common-constants';

export class SendMessageHelpdeskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(SHORT_LENGTH)
  name: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(SHORT_LENGTH)
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(HELPDESK_MESSAGE_LENGTH)
  message: string;
}
