import { Repository } from 'typeorm';
import { User } from '../../resources/users/entities/user.entity';
import { GetUsersDto } from '../../resources/users/dto/get-users.dto';

export interface IQbFindUsers {
  repository: Repository<User>;
  dto: GetUsersDto;
  isSuperAdmin: boolean;
}
