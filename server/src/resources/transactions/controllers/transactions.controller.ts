import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
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
import { GetUser } from '../../../utils/custom-decorators/get-user.decorator';
import { FindRewardsDto } from '../dto/find-rewards.dto';
import { responsePaginationSchema } from '../../../utils/response-pagination-schema';
import { Transaction } from '../entities/transaction.entity';
import { JwtTwoFactorGuard } from '../../auth/guards/jwt-two-factor.guard';
import { FindTransactionsDto } from '../dto/find-transactions.dto';
import { SendInternalTransferCodeDto } from '../dto/send-internal-transfer-code.dto';
import { CreateInternalTransactionDto } from '../dto/create-internal-transaction.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Transactions')
@Controller({
  path: 'transactions',
  version: '1',
})
@ApiExtraModels(Transaction)
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @ApiResponse(responsePaginationSchema(Transaction))
  @UseInterceptors(ClassSerializerInterceptor)
  async find(@GetUser('id') userId: string, @Query() dto: FindTransactionsDto) {
    return await this.service.find({ ...dto, userId });
  }

  @Get('rewards')
  @ApiResponse(responsePaginationSchema(Transaction))
  @UseInterceptors(ClassSerializerInterceptor)
  async findRewards(
    @GetUser('id') userId: string,
    @Query() dto: FindRewardsDto,
  ) {
    return await this.service.findRewards({ userId, ...dto });
  }

  @Post('send-internal-transaction-code')
  async sendInternalTransactionCode(
    @GetUser('id') userId: string,
    @Body() dto: SendInternalTransferCodeDto,
  ) {
    return await this.service.sendInternalTransactionCode({
      ...dto,
      fromUserId: userId,
    });
  }

  @Post('create-internal-transaction')
  @UseInterceptors(ClassSerializerInterceptor)
  async createInternalTransaction(
    @GetUser('id') userId: string,
    @Body() dto: CreateInternalTransactionDto,
  ) {
    return await this.service.createInternalTransaction({
      ...dto,
      fromUserId: userId,
    });
  }
}
