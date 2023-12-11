import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransferStatusesService } from './transfer-statuses.service';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { FindTransferStatusesDto } from './dto/find-transfer-statuses.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Transfer Statuses')
@Controller({
  path: 'transfer-statuses',
  version: '1',
})
export class TransferStatusesController {
  constructor(private readonly service: TransferStatusesService) {}

  // @Roles(RoleEnum.superAdmin)
  // @UseGuards(RolesGuard)
  // @Post()
  // async create(@Body() dto: CreateTransferStatusDto) {
  //   return await this.service.create(dto);
  // }

  @Get()
  async find(@Query() dto: FindTransferStatusesDto) {
    return await this.service.find(dto);
  }

  // @Roles(RoleEnum.superAdmin)
  // @UseGuards(RolesGuard)
  // @Put(':id')
  // async update(@Param('id') id: string, @Body() dto: UpdateTransferStatusDto) {
  //   return await this.service.update({ id }, dto);
  // }

  // @Roles(RoleEnum.superAdmin)
  // @UseGuards(RolesGuard)
  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return await this.service.delete({ id });
  // }
}
