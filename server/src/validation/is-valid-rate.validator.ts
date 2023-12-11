import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { BadRequestException } from '@nestjs/common';
import { FixedCurrencyRatesService } from '../resources/fixed-currency-rates/fixed-currency-rates.service';

@ValidatorConstraint({ name: 'IsValidRate', async: true })
export class IsValidRate implements ValidatorConstraintInterface {
  constructor(private fixedCurrencyRatesService: FixedCurrencyRatesService) {}
  async validate(id: string, validationArguments: ValidationArguments) {
    if (!id) {
      throw new BadRequestException(
        `Fixed currency rate id should not be null or undefined`,
      );
    }
    const entity: unknown = await this.fixedCurrencyRatesService.isValid({
      id,
    });
    return Boolean(entity);
  }
}
