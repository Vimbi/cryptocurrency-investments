import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Currencies')
@Controller({
  path: 'currencies',
  version: '1',
})
export class CurrenciesController {
  constructor(private readonly service: CurrenciesService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Post()
  async create(@Body() dto: CreateCurrencyDto) {
    return await this.service.create(dto);
  }

  @Get()
  async findAll() {
    return await this.service.find();
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCurrencyDto) {
    return await this.service.update({ id }, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete({ id });
  }
}
