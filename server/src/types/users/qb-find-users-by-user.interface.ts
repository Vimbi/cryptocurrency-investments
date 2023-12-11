import { Repository } from 'typeorm';
import { User } from '../../resources/users/entities/user.entity';
import { GetUsersByUserDto } from '../../resources/users/dto/get-users-by-user.dto';

export interface IQbFindUsersByUser {
  repository: Repository<User>;
  dto: GetUsersByUserDto;
  userId: string;
}
