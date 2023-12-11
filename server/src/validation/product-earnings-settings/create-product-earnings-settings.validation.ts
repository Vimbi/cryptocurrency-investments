import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';
import { CreateProductEarningsSettingDto } from '../../resources/product-earnings-settings/dto/create-product-earnings-setting.dto';
import { ProductEarningsSettingsService } from '../../resources/product-earnings-settings/product-earnings-settings.service';
import { convertPercentageToNumber } from '../../utils/convert-percentage-to-number';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CreateProductEarningsSettingValidation implements PipeTransform {
  private readonly _payrollTime: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly productEarningsSettingsService: ProductEarningsSettingsService,
  ) {
    this._payrollTime = this.configService.get('investments.payrollTime');
  }

  async transform(
    dto: CreateProductEarningsSettingDto,
    _metadata: ArgumentMetadata,
  ) {
    const { date, productId } = dto;
    const errors: string[] = [];
    const result = await this.productEarningsSettingsService.findOneBy({
      date,
      productId,
    });

    const todayPayrollDate = moment()
      .hour(this._payrollTime)
      .minute(0)
      .second(0);

    const isToday = moment().startOf('day').isSame(date, 'd');

    if (isToday) {
      if (moment().isAfter(todayPayrollDate)) {
        throw new BadRequestException(errorMsgs.creatingPastPeriodEarnings);
      }
    } else {
      if (moment(date).isBefore()) {
        throw new BadRequestException(errorMsgs.creatingPastPeriodEarnings);
      }
    }

    if (result) {
      errors.push(errorMsgs.productEarningsSettingExists);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    dto.percentage = convertPercentageToNumber(dto.percentage);

    return dto;
  }
}
