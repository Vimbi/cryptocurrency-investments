import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { GetQueryDto } from '../../../types/get-query.dto';
import { Transform } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import * as moment from 'moment';

export class FindProductEarningsSettingsDto extends OmitType(GetQueryDto, [
  'search',
] as const) {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'), {
    toClassOnly: true,
  })
  @IsOptional()
  afterDate?: Date;

  @ApiPropertyOptional()
  @IsISO8601()
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'), {
    toClassOnly: true,
  })
  @IsOptional()
  beforeDate?: Date;
}
