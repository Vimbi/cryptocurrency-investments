import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transferId: string;
}
