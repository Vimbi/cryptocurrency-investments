export interface ICreateUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  surname?: string;
  roleId: string;
  statusId: string;
}
