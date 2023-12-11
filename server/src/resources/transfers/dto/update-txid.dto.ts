import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, NotContains } from 'class-validator';
import { errorMsgs } from '../../../shared/error-messages';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';

export class UpdateTxIdDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transferId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(SHORT_LENGTH, {
    message: `txId:${errorMsgs.maxLengthField} ${SHORT_LENGTH}`,
  })
  @NotContains(' ', { message: `txId:${errorMsgs.noWhiteSpaces}` })
  @IsNotEmpty({ message: `txId:${errorMsgs.notEmptyField}` })
  txId: string;
}
