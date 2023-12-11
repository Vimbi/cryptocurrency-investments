import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { parseMobileNumber } from '../../../utils/cast.helper';
import { IsPhoneNumber } from '../../../validation/is-phone-number.validator';
import {
  AVERAGE_LENGTH,
  LONG_LENGTH,
} from '../../../utils/constants/common-constants';

export class CreateOfficeOpeningRequestDto {
  @ApiProperty()
  @Transform(({ value }) => {
    return parseMobileNumber(value);
  })
  @Validate(IsPhoneNumber, {
    message: `phone:${errorMsgs.mustBePhoneNumber}`,
  })
  phone: string;

  @ApiProperty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: `email:${errorMsgs.mustBeEmail}` })
  @MaxLength(AVERAGE_LENGTH, {
    message: `email:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  email: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: `name:${errorMsgs.notEmptyField}` })
  @MaxLength(AVERAGE_LENGTH, {
    message: `name:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  name: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: `surname:${errorMsgs.notEmptyField}` })
  @MaxLength(AVERAGE_LENGTH, {
    message: `surname:${errorMsgs.maxLengthField} ${AVERAGE_LENGTH}`,
  })
  surname: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: `surname:${errorMsgs.notEmptyField}` })
  @MaxLength(LONG_LENGTH, {
    message: `surname:${errorMsgs.maxLengthField} ${LONG_LENGTH}`,
  })
  @IsOptional()
  note?: string;
}
