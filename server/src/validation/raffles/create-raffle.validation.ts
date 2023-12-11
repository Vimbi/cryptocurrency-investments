import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';
import { CreateRaffleDto } from '../../resources/raffles/dto/create-raffle.dto';

@Injectable()
export class CreateRaffleValidation implements PipeTransform {
  async transform(dto: CreateRaffleDto, _metadata: ArgumentMetadata) {
    const { localeContent } = dto;
    const { files } = localeContent;
    const errors: string[] = [];

    if (files?.length) {
      if (new Set(files).size !== files.length) {
        errors.push(errorMsgs.imageDuplicate);
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return dto;
  }
}
