import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GetQueryDto } from '../../../types/get-query.dto';
import { Type } from 'class-transformer';
import { IFindInvestmentsTransactions } from '../../../types/investments-transactions/find-investments-transactions.interface';

export class FindInvestmentsTransactionsDto
  extends OmitType(GetQueryDto, ['search'] as const)
  implements IFindInvestmentsTransactions
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

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  typeId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  localeId?: string;
}
