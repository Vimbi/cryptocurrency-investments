import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { TransferIdDto } from './transfer-id.dto';
import { LONG_LENGTH } from '../../../utils/constants/common-constants';
import { errorMsgs } from '../../../shared/error-messages';

export class CancelTransferDto extends TransferIdDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(LONG_LENGTH, {
    message: `txId:${errorMsgs.maxLengthField} ${LONG_LENGTH}`,
  })
  @ValidateIf((object, value) => value !== null)
  @IsOptional()
  note?: string;
}
