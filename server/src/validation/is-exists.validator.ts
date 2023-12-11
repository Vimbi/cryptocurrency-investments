import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { BadRequestException } from '@nestjs/common';

@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
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
    return Boolean(entity);
  }
}
