import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArticleTypesService } from './article-types.service';
import { CreateArticleTypeDto } from './dto/create-article-type.dto';
import { UpdateArticleTypeDto } from './dto/update-article-type.dto';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { FindArticleTypesDto } from './dto/find-article-types.dto';

@ApiBearerAuth()
@ApiTags('Article Types')
@Controller({
  path: 'article-types',
  version: '1',
})
export class ArticleTypesController {
  constructor(private readonly service: ArticleTypesService) {}

  @Roles(RoleEnum.superAdmin)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Post()
  async create(@Body() dto: CreateArticleTypeDto) {
    return await this.service.create(dto);
  }

  @Public()
  @Get()
  async findAll(@Query() dto: FindArticleTypesDto) {
    return await this.service.find(dto);
  }

  @Roles(RoleEnum.superAdmin)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateArticleTypeDto) {
    return await this.service.update({ id }, dto);
  }

  @Roles(RoleEnum.superAdmin)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete({ id });
  }
}
