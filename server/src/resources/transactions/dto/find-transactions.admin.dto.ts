import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GetQueryDto } from '../../../types/get-query.dto';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IFindTransactions } from '../../../types/transactions/find-transactions.interface';

export class FindTransactionsAdminDto
  extends GetQueryDto
  implements IFindTransactions
{
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  typeId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  localeId: string;

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
