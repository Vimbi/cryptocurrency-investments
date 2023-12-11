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
import { UserStatusDto } from './dto/user.status.dto';
import { UserStatusesService } from './user-statuses.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@Roles(RoleEnum.superAdmin)
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@ApiTags('UserStatus')
@Controller({
  path: 'user-statuses',
  version: '1',
})
export class UserStatusesController {
  constructor(private readonly statusesService: UserStatusesService) {}

  @Post()
  async create(@Body() statusDto: UserStatusDto) {
    return await this.statusesService.create(statusDto);
  }

  @Get()
  async findAll(@Query() dto: GetQueryDto) {
    return await this.statusesService.find(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() statusDto: UserStatusDto) {
    return await this.statusesService.update(id, statusDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.statusesService.delete(id);
  }
}
