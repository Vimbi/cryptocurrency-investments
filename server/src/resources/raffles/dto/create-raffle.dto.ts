import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRaffleLocaleContentDto } from '../../raffles-local-content/dto/create-raffle-locale-content.dto';

export class CreateRaffleDto {
  @ApiProperty()
  @IsDateString()
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateRaffleLocaleContentDto)
  localeContent: CreateRaffleLocaleContentDto;
}
