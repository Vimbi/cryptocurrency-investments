import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { CreateDepositTransferDto } from '../../resources/transfers/dto/create-deposit-transfer.dto';
import { TransferTypeEnum } from '../../resources/transfers/transfer-types.enum';
import { TransferStatusesService } from '../../resources/transfer-statuses/transfer-statuses.service';
import { TransferStatusEnum } from '../../resources/transfer-statuses/transfer-status.enum';
import { TransferTypesService } from '../../resources/transfer-types/transfer-types.service';
import { FixedCurrencyRatesService } from '../../resources/fixed-currency-rates/fixed-currency-rates.service';
import { errorMsgs } from '../../shared/error-messages';

@Injectable()
export class CreateDepositTransferValidation implements PipeTransform {
  constructor(
    private readonly fixedCurrencyRatesService: FixedCurrencyRatesService,
    private readonly statusesService: TransferStatusesService,
    private readonly typesService: TransferTypesService,
  ) {}

  async transform(dto: CreateDepositTransferDto, _metadata: ArgumentMetadata) {
    const { fromAddress, fixedCurrencyRateId } = dto;

    const {
      network: {
        currency: { isSenderAddressRequired },
      },
    } = await this.fixedCurrencyRatesService.findOneOrFail({
      where: { id: fixedCurrencyRateId },
      relations: { network: { currency: true } },
    });
    if (isSenderAddressRequired && !fromAddress) {
      throw new BadRequestException(
        `fromAddress:${errorMsgs.fromAddressRequired}`,
      );
    }
    if (!isSenderAddressRequired && fromAddress) {
      delete dto.fromAddress;
    }

    const depositType = await this.typesService.findOneOrFail({
      name: TransferTypeEnum.deposit,
    });

    dto.typeId = depositType.id;

    const status = await this.statusesService.findOneOrFail({
      name: TransferStatusEnum.pending,
    });
    dto.statusId = status.id;

    return dto;
  }
}
