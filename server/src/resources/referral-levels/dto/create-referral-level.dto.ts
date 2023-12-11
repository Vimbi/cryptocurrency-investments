import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';
import { Transform } from 'class-transformer';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';

export class CreateReferralLevelDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  @Validate(IsNotExist, ['ReferralLevel', 'level'], {
    message: errorMsgs.referralLevelExists,
  })
  level: number;

  @ApiProperty()
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  percentage: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
