import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { parsePhoneNumber } from 'libphonenumber-js/mobile';

@ValidatorConstraint({ name: 'IsPhoneNumber', async: true })
@Injectable()
export class IsPhoneNumber implements ValidatorConstraintInterface {
  async validate(value: string, validationArguments: ValidationArguments) {
    if (!value) {
      throw new BadRequestException('Phone should not be null or undefined');
    }
    try {
      const phoneNumber = parsePhoneNumber(value, 'RU');
      return Boolean(phoneNumber.isValid());
    } catch (error) {
      return false;
    }
  }
}
