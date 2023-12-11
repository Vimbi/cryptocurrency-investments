import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ThemeEnum } from '../../files/theme.enum';

export class FindArticleDto {
  @ApiProperty()
  @IsString()
  articleId: string;

  @ApiProperty()
  @IsString()
  localeId: string;

  @ApiProperty()
  @IsString()
  theme: ThemeEnum;
}
