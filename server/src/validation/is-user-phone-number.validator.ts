import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../resources/users/users.service';
import { UserStatusesService } from '../resources/user-statuses/user-statuses.service';
import { UserStatusEnum } from '../resources/user-statuses/user-status.enum';
import { errorMsgs } from '../shared/error-messages';
import { parsePhoneNumber } from 'libphonenumber-js/mobile';

@ValidatorConstraint({ name: 'IsUserPhoneNumber', async: true })
@Injectable()
export class IsUserPhoneNumber implements ValidatorConstraintInterface {
  constructor(
    private usersService: UsersService,
    private userStatusesService: UserStatusesService,
  ) {}
  async validate(value: string, validationArguments: ValidationArguments) {
    if (!value) {
      throw new BadRequestException('Phone should not be null or undefined');
    }
    const statusActive = await this.userStatusesService.findOne({
      name: UserStatusEnum.active,
    });
    const user = await this.usersService.findOneBy({
      phone: value,
      statusId: statusActive.id,
    });
    if (user) {
      throw new BadRequestException(errorMsgs.phoneExists);
    }
    try {
      const phoneNumber = parsePhoneNumber(value, 'RU');
      return Boolean(phoneNumber.isValid());
    } catch (error) {
      return false;
    }
  }
}
