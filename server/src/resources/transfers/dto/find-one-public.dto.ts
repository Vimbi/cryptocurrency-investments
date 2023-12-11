import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator';
import { IFindTransfer } from '../../../types/transfers/find-transfer.interface';

export class TransferFindOnePublicDto implements Omit<IFindTransfer, 'userId'> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @NotContains(' ')
  id: string;

  @ApiPropertyOptional()
  @IsString()
  @NotContains(' ')
  @IsOptional()
  localeId?: string;
}
