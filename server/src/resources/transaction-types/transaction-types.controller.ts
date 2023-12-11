import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransactionTypesService } from './transaction-types.service';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { FindTransactionTypesDto } from './dto/find-transaction-types.dto';

@ApiBearerAuth()
@Roles(RoleEnum.superAdmin)
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@ApiTags('Transaction Types')
@Controller({
  path: 'transaction-types',
  version: '1',
})
export class TransactionTypesController {
  constructor(private readonly service: TransactionTypesService) {}

  @Get()
  async findAll(@Query() dto: FindTransactionTypesDto) {
    return await this.service.findAll(dto);
  }
}
