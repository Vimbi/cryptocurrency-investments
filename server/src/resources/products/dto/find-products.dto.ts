import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { GetQueryDto } from '../../../types/get-query.dto';

export class FindProductsDto extends GetQueryDto {
  @ApiProperty()
  @IsString()
  localeId: string;
}
