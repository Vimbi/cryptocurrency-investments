import { ApiProperty } from '@nestjs/swagger';
import { IInvestmentsGetInfo } from './get-info.interface';

export class InvestmentsGetInfo implements IInvestmentsGetInfo {
  @ApiProperty()
  balance: number;

  @ApiProperty()
  totalIncome: number;

  @ApiProperty()
  finesNumber: number;

  @ApiProperty()
  finesAmount: number;

  @ApiProperty()
  productId: string | null;
}
