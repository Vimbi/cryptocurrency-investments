import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { AccountStatementsService } from './account-statements.service';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { GetBalanceResponseDto } from './dto/get-balance-response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Account statements')
@Controller({
  path: 'account-statements',
  version: '1',
})
export class AccountStatementsController {
  constructor(private readonly service: AccountStatementsService) {}

  @Get('get-balance')
  @ApiResponse({
    type: GetBalanceResponseDto,
  })
  async getBalance(@GetUser('id') userId: string) {
    return await this.service.getBalance(userId);
  }

  @Post('create-last-month')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async createLastMonth() {
    return await this.service._createAccountStatements();
  }
}
