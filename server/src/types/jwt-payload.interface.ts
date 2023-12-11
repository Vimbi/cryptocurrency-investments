import { Role } from '../resources/roles/entities/role.entity';

export interface IJwtPayload {
  id: string;
  role: Role;
  isSecondFactorAuthenticated: boolean;
}
