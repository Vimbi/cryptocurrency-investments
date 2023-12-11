import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateRaffleDto } from './create-raffle.dto';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { UpdateRaffleLocaleContentDto } from '../../raffles-local-content/dto/update-article-locale-content.dto';
import { Type } from 'class-transformer';

export class UpdateRaffleDto extends PartialType(
  OmitType(CreateRaffleDto, ['localeContent']),
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  raffleId: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => UpdateRaffleLocaleContentDto)
  localeContent: UpdateRaffleLocaleContentDto;
}
