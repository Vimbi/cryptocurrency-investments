import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { GetQueryDto } from '../../../types/get-query.dto';
import { IGetTransfers } from '../../../types/transfers/get-transfers.interface';
import { Type } from 'class-transformer';

export class GetTransfersDto
  extends OmitType(GetQueryDto, ['search'] as const)
  implements IGetTransfers
{
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  statusId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  typeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currencyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  networkId?: string;

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
  @IsOptional()
  localeId?: string;
}
