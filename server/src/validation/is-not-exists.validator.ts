import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsNotExist', async: true })
@Injectable()
export class IsNotExist implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}
  async validate(value: string, validationArguments: ValidationArguments) {
    const repository = validationArguments.constraints[0];
    const pathToProperty = validationArguments.constraints[1];
    if (!value) {
      throw new BadRequestException(
        `${repository} should not be null or undefined`,
      );
    }
    const entity: unknown = await this.dataSource
      .getRepository(repository)
      .findOneBy({
        [pathToProperty]: value,
      });
    return Boolean(!entity);
  }
}
