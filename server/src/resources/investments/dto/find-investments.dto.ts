import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { GetQueryDto } from '../../../types/get-query.dto';
import { Type } from 'class-transformer';
import { IFindInvestments } from '../../../types/investments/find-transfers.interface';

export class FindInvestmentsDto
  extends OmitType(GetQueryDto, ['search'] as const)
  implements IFindInvestments
{
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
