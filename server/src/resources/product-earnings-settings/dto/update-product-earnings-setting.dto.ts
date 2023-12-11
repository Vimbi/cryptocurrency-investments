import { OmitType } from '@nestjs/swagger';
import { CreateProductEarningsSettingDto } from './create-product-earnings-setting.dto';

export class UpdateProductEarningsSettingDto extends OmitType(
  CreateProductEarningsSettingDto,
  ['date', 'productId'] as const,
) {}
