import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { IsNotExist } from '../../../validation/is-not-exists.validator';

export class RoleDto {
  @ApiProperty()
  @Validate(IsNotExist, ['Role', 'name'], {
    message: errorMsgs.roleNameExists,
  })
  name: string;

  @ApiProperty()
  @Validate(IsNotExist, ['Role', 'displayName'], {
    message: errorMsgs.roleDisplayNameExists,
  })
  @IsOptional()
  displayName?: string;
}
