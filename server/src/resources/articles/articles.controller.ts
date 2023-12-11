import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { FindArticlesDto } from './dto/find-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateArticleValidation } from '../../validation/articles/create-article.validation';
import { UpdateArticleValidation } from '../../validation/articles/update-article.validation';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { FindArticleDto } from './dto/find-article.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Articles')
@Controller({
  path: 'articles',
  version: '1',
})
export class ArticlesController {
  constructor(private readonly service: ArticlesService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  @Post()
  async create(@Body(CreateArticleValidation) dto: CreateArticleDto) {
    return await this.service.create(dto);
  }

  @Public()
  @Get()
  async find(@Query() dto: FindArticlesDto) {
    return await this.service.find({ ...dto, isPublished: true });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.superAdmin)
  @Get('admin')
  async findAll(@Query() dto: FindArticlesDto) {
    return await this.service.find(dto);
  }

  @Public()
  @Get('one')
  async findOne(@GetUser('id') userId: string, @Query() dto: FindArticleDto) {
    return await this.service.findOnePublic({
      userId,
      dto,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.superAdmin)
  @Patch()
  async update(@Body(UpdateArticleValidation) dto: UpdateArticleDto) {
    return await this.service.update(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
