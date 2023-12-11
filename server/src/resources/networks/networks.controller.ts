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
import { NetworksService } from './networks.service';
import { CreateNetworkDto } from './dto/create-network.dto';
import { GetNetworksDto } from './dto/get-networks.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Networks')
@Controller({
  path: 'networks',
  version: '1',
})
export class NetworksController {
  constructor(private readonly service: NetworksService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Post()
  async create(@Body() dto: CreateNetworkDto) {
    return await this.service.create(dto);
  }

  @Get()
  async find(@Query() { currencyId }: GetNetworksDto) {
    return await this.service.find({ currencyId });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateNetworkDto) {
    return await this.service.update({ id }, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete({ id });
  }
}
