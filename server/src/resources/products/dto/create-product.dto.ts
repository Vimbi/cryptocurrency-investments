import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';
import { CreateProductLocaleContentDto } from '../../products-locale-content/dto/create-product-locale-content.dto';

export class CreateProductDto {
  @ApiProperty()
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  price: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateProductLocaleContentDto)
  localeContent: CreateProductLocaleContentDto;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isProlongsInvestment?: boolean;
}
