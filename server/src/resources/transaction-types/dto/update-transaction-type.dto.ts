import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateTransactionTypeLocaleContentDto } from '../../transaction-types-locale-content/dto/update-transaction-type-locale-content.dto';

export class UpdateTransactionTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transactionTypeId: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => UpdateTransactionTypeLocaleContentDto)
  localeContent: UpdateTransactionTypeLocaleContentDto;
}
