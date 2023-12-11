import { ApiPropertyOptional } from '@nestjs/swagger';
import { GetQueryDto } from '../../../types/get-query.dto';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class FindRewardsDto extends GetQueryDto {
  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  afterDate?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  beforeDate?: Date;
}
