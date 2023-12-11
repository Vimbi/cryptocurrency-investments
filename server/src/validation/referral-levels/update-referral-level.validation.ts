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
import { UpdateReferralLevelDto } from '../../resources/referral-levels/dto/update-referral-level.dto';

@Injectable()
export class UpdateReferralLevelValidation implements PipeTransform {
  private readonly _referralLevelsTotalPercentageMaxLimit: number;
  constructor(
    private readonly referralLevelsService: ReferralLevelsService,
    private readonly configService: ConfigService,
  ) {
    this._referralLevelsTotalPercentageMaxLimit = this.configService.get(
      'referralProgram.totalPercentageMaxLimit',
    );
  }

  async transform(dto: UpdateReferralLevelDto, _metadata: ArgumentMetadata) {
    const { percentage, referrralLevelId } = dto;
    const errors: string[] = [];

    if (percentage) {
      const totalPercentage =
        await this.referralLevelsService.getTotalPercentage();

      const referralLevel = await this.referralLevelsService.findOneOrFail({
        id: referrralLevelId,
      });

      const newPercentage = convertNumberToPercentage(percentage);
      const currentLevelPercentage = convertNumberToPercentage(
        referralLevel.percentage,
      );

      if (
        totalPercentage + newPercentage - currentLevelPercentage >
        this._referralLevelsTotalPercentageMaxLimit
      ) {
        errors.push(
          `${errorMsgs.referralLevelsPercentageLimit} ${this._referralLevelsTotalPercentageMaxLimit}`,
        );
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }
}
