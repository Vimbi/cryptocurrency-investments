import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import {
  AVERAGE_LENGTH,
  FILES_NUMBER_LIMIT,
  LARGE_LENGTH,
} from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';
import { Type } from 'class-transformer';
import { IsExist } from '../../../validation/is-exists.validator';
import { Locale } from '../../locales/entities/locale.entity';
import { CreateRaffleFileDto } from '../../raffles/dto/create-raffle-file.dto';

export class CreateRaffleLocaleContentDto {
  @ApiProperty()
  @Validate(IsExist, [Locale.name, 'id'], {
    message: errorMsgs.localeNotFound,
  })
  localeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AVERAGE_LENGTH)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(LARGE_LENGTH)
  description: string;

  @ApiPropertyOptional()
  @ArrayMaxSize(FILES_NUMBER_LIMIT, {
    message: `files:${errorMsgs.maxQuantity} ${FILES_NUMBER_LIMIT}`,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateRaffleFileDto)
  @IsOptional()
  files?: CreateRaffleFileDto[];
}
