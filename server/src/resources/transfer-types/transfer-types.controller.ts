import { Controller, Get, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateTransferTypeDto } from './dto/update-transfer-type.dto';
import { TransferTypesService } from './transfer-types.service';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Transfer Types')
@Controller({
  path: 'transfer-types',
  version: '1',
})
export class TransferTypesController {
  constructor(private readonly service: TransferTypesService) {}

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Roles(RoleEnum.superAdmin)
  @UseGuards(RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTransferTypeDto) {
    return await this.service.update({ id }, dto);
  }
}
