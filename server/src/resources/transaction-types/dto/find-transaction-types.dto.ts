import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindTransactionTypesDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  localeId?: string;
}
