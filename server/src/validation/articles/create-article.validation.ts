import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { errorMsgs } from '../../shared/error-messages';
import { CreateArticleDto } from '../../resources/articles/dto/create-article.dto';

@Injectable()
export class CreateArticleValidation implements PipeTransform {
  async transform(dto: CreateArticleDto, _metadata: ArgumentMetadata) {
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
