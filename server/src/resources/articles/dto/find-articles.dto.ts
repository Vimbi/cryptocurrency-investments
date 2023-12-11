import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { GetQueryDto } from '../../../types/get-query.dto';
import { ThemeEnum } from '../../files/theme.enum';

export class FindArticlesDto extends GetQueryDto {
  @ApiPropertyOptional({ type: 'boolean' })
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  typeId?: string;

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

  @ApiProperty()
  @IsString()
  localeId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  theme?: ThemeEnum;
}
