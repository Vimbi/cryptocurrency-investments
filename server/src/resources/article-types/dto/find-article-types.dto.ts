import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindArticleTypesDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  localeId?: string;
}
