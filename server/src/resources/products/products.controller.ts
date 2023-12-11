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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { FindProductsDto } from './dto/find-products.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Products')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  async create(@Body() dto: CreateProductDto) {
    return await this.service.create(dto);
  }

  @Public()
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() dto: FindProductsDto) {
    return await this.service.find(dto);
  }

  @Public()
  @Get('prices')
  @UseInterceptors(ClassSerializerInterceptor)
  async findWithPrices(@Query() dto: FindProductsDto) {
    return await this.service.findWithPrices(dto);
  }

  @Patch()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  async update(@Body() dto: UpdateProductDto) {
    return await this.service.update(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete({ id });
  }
}
