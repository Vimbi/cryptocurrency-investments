import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import * as moment from 'moment';

export class FindOneProductEarningsSettingsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsISO8601()
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'), {
    toClassOnly: true,
  })
  date: Date;
}
