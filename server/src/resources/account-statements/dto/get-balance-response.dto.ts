import { ApiProperty } from '@nestjs/swagger';
import { IGetBalanceResponse } from '../../../types/account-statements/get-balance-response.interface';

export class GetBalanceResponseDto implements IGetBalanceResponse {
  @ApiProperty()
  balance: number;
  @ApiProperty()
  invested: number;
  @ApiProperty()
  income: number;
  @ApiProperty({ nullable: true })
  investmentDueDate: Date | null;
  @ApiProperty({ nullable: true })
  lastUpdateDate: Date;
  @ApiProperty()
  lastIncomePercent: number;
  @ApiProperty({ nullable: true })
  productId: string;
}
