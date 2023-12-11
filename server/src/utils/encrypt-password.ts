import * as bcrypt from 'bcryptjs';
import { saltRounds } from '../common/config';

export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};
