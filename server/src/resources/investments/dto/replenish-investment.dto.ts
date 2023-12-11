import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';

export class ReplenishInvestmentDto {
  @ApiProperty()
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  amount: number;
}
