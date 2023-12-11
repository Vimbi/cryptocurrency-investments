import {
  ArgumentMetadata,
  ForbiddenException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FindOneProductEarningsSettingsDto } from '../../resources/product-earnings-settings/dto/find-one-product-earnings-setting.dto';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class UpdateProductEarningsSettingQueryValidation
  implements PipeTransform
{
  private readonly _payrollTime: number;

  constructor(private readonly configService: ConfigService) {
    this._payrollTime = this.configService.get('investments.payrollTime');
  }

  async transform(
    dto: FindOneProductEarningsSettingsDto,
    _metadata: ArgumentMetadata,
  ) {
    const { date } = dto;

    const todayPayrollDate = moment()
      .hour(this._payrollTime)
      .minute(0)
      .second(0);
    const lastPayrollDate = moment().isBefore(todayPayrollDate)
      ? moment().subtract(1, 'days').hour(this._payrollTime).minute(0).second(0)
      : todayPayrollDate;
    if (moment(date).isBefore(lastPayrollDate)) {
      throw new ForbiddenException(errorMsgs.changingPastPeriodEarnings);
    }

    return dto;
  }
}
