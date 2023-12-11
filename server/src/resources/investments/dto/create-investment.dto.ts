import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsPositive, Validate } from 'class-validator';
import { convertDollarsToCents } from '../../../utils/convert-dollars-to-cents';
import { IsExist } from '../../../validation/is-exists.validator';
import { Product } from '../../products/entities/product.entity';
import { errorMsgs } from '../../../shared/error-messages';

export class CreateInvestmentDto {
  @ApiProperty()
  @Transform(({ value }) => convertDollarsToCents(value), { toClassOnly: true })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @Validate(IsExist, [Product.name, 'id'], {
    message: errorMsgs.productNotFound,
  })
  productId: string;
}
