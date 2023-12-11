import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReferralLevelDto } from './create-referral-level.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReferralLevelDto extends PartialType(
  CreateReferralLevelDto,
) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  referrralLevelId: string;
}
