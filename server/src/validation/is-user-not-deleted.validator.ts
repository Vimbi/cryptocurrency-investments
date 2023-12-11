import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../resources/users/entities/user.entity';

@ValidatorConstraint({ name: 'IsUserNotDeleted', async: true })
@Injectable()
export class IsUserNotDeleted implements ValidatorConstraintInterface {
  constructor(private dataSource: DataSource) {}
  async validate(value: string, validationArguments: ValidationArguments) {
    if (!value) {
      throw new BadRequestException(
        `${validationArguments.property} should not be null, undefined, empty string`,
      );
    }
    const user = await this.dataSource.getRepository(User).findOneBy({
      [validationArguments.property]: value,
    });
    return user ? !user.deletedAt : true;
  }
}
