import { OmitType } from '@nestjs/swagger';
import { FindTransactionsAdminDto } from './find-transactions.admin.dto';

export class FindTransactionsDto extends OmitType(FindTransactionsAdminDto, [
  'userId',
] as const) {}
