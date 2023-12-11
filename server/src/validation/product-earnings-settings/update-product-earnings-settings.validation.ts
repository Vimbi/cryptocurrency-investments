import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { convertPercentageToNumber } from '../../utils/convert-percentage-to-number';
import { UpdateProductEarningsSettingDto } from '../../resources/product-earnings-settings/dto/update-product-earnings-setting.dto';

@Injectable()
export class UpdateProductEarningsSettingValidation implements PipeTransform {
  async transform(
    dto: UpdateProductEarningsSettingDto,
    _metadata: ArgumentMetadata,
  ) {
    dto.percentage = convertPercentageToNumber(dto.percentage);

    return dto;
  }
}
