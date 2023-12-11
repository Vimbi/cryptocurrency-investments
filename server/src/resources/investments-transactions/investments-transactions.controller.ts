import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InvestmentsTransactionsService } from './investments-transactions.service';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { FindInvestmentsTransactionsDto } from './dto/find-investments-transactions.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Investments transactions')
@Controller({
  path: 'investments-transactions',
  version: '1',
})
export class InvestmentsTransactionsController {
  constructor(private readonly service: InvestmentsTransactionsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async find(
    @GetUser('id') userId: string,
    @Query() dto: FindInvestmentsTransactionsDto,
  ) {
    return await this.service.find({ ...dto, userId });
  }
}
