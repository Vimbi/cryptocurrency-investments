import { User } from '../../resources/users/entities/user.entity';

export interface IGetChildren {
  level: number;
  userId: string;
  children: User[];
}
