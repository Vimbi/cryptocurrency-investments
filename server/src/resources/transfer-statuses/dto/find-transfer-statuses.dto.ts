import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindTransferStatusesDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  localeId?: string;
}
