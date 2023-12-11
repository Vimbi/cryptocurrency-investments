import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from '../../types/get-query.dto';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@Roles(RoleEnum.superAdmin)
@ApiTags('Roles')
@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post()
  async create(@Body() dto: RoleDto) {
    return await this.service.create(dto);
  }

  @Get()
  async findAll(@Query() dto: GetQueryDto) {
    return await this.service.find(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: RoleDto) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
