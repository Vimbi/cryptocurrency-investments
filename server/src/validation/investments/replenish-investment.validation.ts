import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';
import { ConfigService } from '@nestjs/config';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { ReplenishInvestmentDto } from '../../resources/investments/dto/replenish-investment.dto';

@Injectable()
export class ReplenishInvestmentValidation implements PipeTransform {
  private readonly _minInvestmentAmount: number;
  constructor(private readonly configService: ConfigService) {
    this._minInvestmentAmount = this.configService.get('investments.minAmount');
  }

  async transform(dto: ReplenishInvestmentDto, _metadata: ArgumentMetadata) {
    const { amount } = dto;
    const errors: string[] = [];

    if (amount < this._minInvestmentAmount) {
      errors.push(
        `${errorMsgs.minInvestmentAmount} ${convertCentsToDollars(
          this._minInvestmentAmount,
        )}`,
      );
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }
}
