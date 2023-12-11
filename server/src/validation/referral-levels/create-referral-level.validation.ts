import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';
import { ConfigService } from '@nestjs/config';
import { convertNumberToPercentage } from '../../utils/convert-number-to-percentage';
import { ReferralLevelsService } from '../../resources/referral-levels/referral-levels.service';
import { CreateReferralLevelDto } from '../../resources/referral-levels/dto/create-referral-level.dto';

@Injectable()
export class CreateReferralLevelValidation implements PipeTransform {
  private readonly _referralLevelsTotalPercentageMaxLimit: number;
  private readonly _maxLevel: number;
  constructor(
    private readonly referralLevelsService: ReferralLevelsService,
    private readonly configService: ConfigService,
  ) {
    this._referralLevelsTotalPercentageMaxLimit = this.configService.get(
      'referralProgram.totalPercentageMaxLimit',
    );
    this._maxLevel = this.configService.get('referralProgram.maxLevel');
  }

  async transform(dto: CreateReferralLevelDto, _metadata: ArgumentMetadata) {
    const { percentage } = dto;
    const errors: string[] = [];
    const totalPercentage =
      await this.referralLevelsService.getTotalPercentage();

    if (
      totalPercentage + convertNumberToPercentage(percentage) >
      this._referralLevelsTotalPercentageMaxLimit
    ) {
      errors.push(
        `${errorMsgs.referralLevelsPercentageLimit} ${this._referralLevelsTotalPercentageMaxLimit}`,
      );
    }

    const levelsNumber = await this.referralLevelsService.count();

    if (levelsNumber + 1 > this._maxLevel) {
      errors.push(`${errorMsgs.referralLevelsMaxNumber} ${this._maxLevel}`);
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }
}
