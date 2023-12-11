import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';

export class AuthUpdateDto {
  @ApiPropertyOptional()
  @IsString({ message: errorMsgs.mustBeString })
  @IsNotEmpty({ message: `firstName:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `firstName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString({ message: errorMsgs.mustBeString })
  @IsNotEmpty({ message: `lastName:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `lastName:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString({ message: errorMsgs.mustBeString })
  @IsNotEmpty({ message: `surname:${errorMsgs.notEmptyField}` })
  @MaxLength(SHORT_LENGTH, {
    message: `surname:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  @IsOptional()
  surname?: string;
}
