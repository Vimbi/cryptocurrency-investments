import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';
import { CreateInvestmentDto } from '../../resources/investments/dto/create-investment.dto';
import { ConfigService } from '@nestjs/config';
import { convertCentsToDollars } from '../../utils/convert-cents-to-dollars';
import { ProductsService } from '../../resources/products/products.service';

@Injectable()
export class CreateInvestmentValidation implements PipeTransform {
  private readonly _minInvestmentAmount: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {
    this._minInvestmentAmount = this.configService.get('investments.minAmount');
  }

  async transform(dto: CreateInvestmentDto, _metadata: ArgumentMetadata) {
    const { amount, productId } = dto;
    const errors: string[] = [];

    if (amount < this._minInvestmentAmount) {
      errors.push(
        `${errorMsgs.minInvestmentAmount} ${convertCentsToDollars(
          this._minInvestmentAmount,
        )}`,
      );
    }

    const product = await this.productsService.findPrevious({ id: productId });

    if (product?.price >= amount) {
      errors.push(errorMsgs.investmentAmountLessThanProductPrice);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }
}
