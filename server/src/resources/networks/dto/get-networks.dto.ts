import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetNetworksDto {
  @ApiPropertyOptional()
  @IsOptional()
  currencyId?: string;
}
