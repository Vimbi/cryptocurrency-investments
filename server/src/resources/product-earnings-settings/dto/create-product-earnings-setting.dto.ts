import { ApiProperty } from '@nestjs/swagger';
import {
  IsISO8601,
  IsNumber,
  IsPositive,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { Transform } from 'class-transformer';
import { MAX_DECIMAL_PLACES } from '../../../utils/constants/common-constants';
import { IsExist } from '../../../validation/is-exists.validator';
import * as moment from 'moment';

export class CreateProductEarningsSettingDto {
  @ApiProperty()
  @IsISO8601()
  @Transform(({ value }) => moment(value).format('YYYY-MM-DD'), {
    toClassOnly: true,
  })
  date: Date;

  @ApiProperty()
  @Validate(IsExist, ['Product', 'id'], {
    message: errorMsgs.productNotFound,
  })
  productId: string;

  @ApiProperty()
  @IsPositive()
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: MAX_DECIMAL_PLACES,
  })
  @Min(0.01)
  @Max(99.99)
  percentage: number;
}
