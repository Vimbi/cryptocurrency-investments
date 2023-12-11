import { OmitType } from '@nestjs/swagger';
import { GetUsersDto } from './get-users.dto';

export class GetUsersByUserDto extends OmitType(GetUsersDto, [
  'phone',
  'email',
  'userId',
] as const) {}
