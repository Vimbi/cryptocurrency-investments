import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { toArray } from '../utils/cast.helper';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../utils/constants/common-constants';
import { IFindOptions } from './find-options.interface';

export class GetQueryDto implements IFindOptions {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  @Transform(({ value }) => toArray(value), {
    toClassOnly: true,
  })
  @IsArray()
  @IsOptional()
  sort?: string[][];

  @ApiPropertyOptional({ default: DEFAULT_PAGE })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit: number = DEFAULT_LIMIT;
}
