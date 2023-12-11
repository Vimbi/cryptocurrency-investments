import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductEarningsSettingsService } from './product-earnings-settings.service';
import { CreateProductEarningsSettingDto } from './dto/create-product-earnings-setting.dto';
import { CreateProductEarningsSettingValidation } from '../../validation/product-earnings-settings/create-product-earnings-settings.validation';
import { UpdateProductEarningsSettingDto } from './dto/update-product-earnings-setting.dto';
import { FindOneProductEarningsSettingsDto } from './dto/find-one-product-earnings-setting.dto';
import { FindProductEarningsSettingsDto } from './dto/find-product-earnings-settings.dto';
import { responsePaginationSchema } from '../../utils/response-pagination-schema';
import { ProductEarningsSetting } from './entities/product-earnings-setting.entity';
import { UpdateProductEarningsSettingValidation } from '../../validation/product-earnings-settings/update-product-earnings-settings.validation';
import { UpdateProductEarningsSettingQueryValidation } from '../../validation/product-earnings-settings/update-product-earnings-settings.query.validation';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@Roles(RoleEnum.superAdmin)
@ApiTags('Product earnings settings')
@Controller({
  path: 'product-earnings-settings',
  version: '1',
})
@ApiExtraModels(ProductEarningsSetting)
export class ProductEarningsSettingsController {
  constructor(private readonly service: ProductEarningsSettingsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse(responsePaginationSchema(ProductEarningsSetting))
  async findAll(@Query() dto: FindProductEarningsSettingsDto) {
    return await this.service.find(dto);
  }

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body(CreateProductEarningsSettingValidation)
    dto: CreateProductEarningsSettingDto,
  ) {
    return await this.service.create(dto);
  }

  @Patch()
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Query(UpdateProductEarningsSettingQueryValidation)
    query: FindOneProductEarningsSettingsDto,
    @Body(UpdateProductEarningsSettingValidation)
    dto: UpdateProductEarningsSettingDto,
  ) {
    return await this.service.update(query, dto);
  }
}
