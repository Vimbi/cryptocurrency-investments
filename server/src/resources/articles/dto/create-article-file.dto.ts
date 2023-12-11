import { IsIn, IsOptional, Validate } from 'class-validator';
import { IsExist } from '../../../validation/is-exists.validator';
import { errorMsgs } from '../../../shared/error-messages';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeEnum } from '../../files/theme.enum';
import { File } from '../../files/entities/file.entity';

export class CreateArticleFileDto {
  @ApiProperty()
  @Validate(IsExist, [File.name, 'id'], {
    message: errorMsgs.fileNotExist,
  })
  fileId: string;

  @ApiPropertyOptional()
  @IsIn(Object.keys(ThemeEnum))
  @IsOptional()
  theme?: ThemeEnum;
}
