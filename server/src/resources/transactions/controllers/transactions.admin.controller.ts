import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from '../transactions.service';
import { responsePaginationSchema } from '../../../utils/response-pagination-schema';
import { Transaction } from '../entities/transaction.entity';
import { JwtTwoFactorGuard } from '../../auth/guards/jwt-two-factor.guard';
import { Roles } from '../../roles/roles.decorator';
import { RoleEnum } from '../../roles/roles.enum';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { FindTransactionsAdminDto } from '../dto/find-transactions.admin.dto';

@ApiBearerAuth()
@Roles(RoleEnum.superAdmin)
@UseGuards(JwtTwoFactorGuard, RolesGuard)
@ApiTags('Transactions')
@Controller({
  path: 'admin/transactions',
  version: '1',
})
@ApiExtraModels(Transaction)
export class TransactionsAdminController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @ApiResponse(responsePaginationSchema(Transaction))
  @UseInterceptors(ClassSerializerInterceptor)
  async find(@Query() dto: FindTransactionsAdminDto) {
    return await this.service.find(dto);
  }
}
