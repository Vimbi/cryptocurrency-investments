import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { LocalesService } from './locales.service';
import { CreateLocaleDto } from './dto/create-locale.dto';
import { UpdateLocaleDto } from './dto/update-locale.dto';
import { DeleteLocaleDto } from './dto/delete-locale.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Locales')
@Controller({
  path: 'locales',
  version: '1',
})
export class LocalesController {
  constructor(private readonly service: LocalesService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Post()
  async create(@Body() dto: CreateLocaleDto) {
    return await this.service.create(dto);
  }

  @Public()
  @Get()
  async find() {
    return await this.service.find();
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Patch()
  async update(@Body() dto: UpdateLocaleDto) {
    return await this.service.update(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Delete()
  async remove(@Body() { localeId }: DeleteLocaleDto) {
    return await this.service.delete({ id: localeId });
  }
}
