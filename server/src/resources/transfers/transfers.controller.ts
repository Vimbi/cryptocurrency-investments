import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransfersService } from './transfers.service';
import { CreateDepositTransferDto } from './dto/create-deposit-transfer.dto';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { CreateDepositTransferValidation } from '../../validation/transfers/create-deposit-transfer.validation';
import { UpdateTxIdDto } from './dto/update-txid.dto';
import { CreateWithdrawalTransferTransform } from '../../utils/transform/transfers/create-withdrawal-transfer.transform';
import { TransferIdDto } from './dto/transfer-id.dto';
import { CancelTransferDto } from './dto/cancel-transfer.dto';
import { CalculateAmountDto } from './dto/calculate-amount.dto';
import { TransferFindOnePublicDto } from './dto/find-one-public.dto';
import { GetTransfersDto } from './dto/get-transfers.dto';
import { TransferTypeEnum } from './transfer-types.enum';
import { CreateWithdrawalTransferDto } from './dto/create-withdrawal-transfer.dto';
import { Transfer } from './entities/transfer.entity';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { SendWithdrawalCodeDto } from './dto/send-withdrawal-code.dto';
import { responsePaginationSchema } from '../../utils/response-pagination-schema';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Transfers')
@Controller({
  path: 'transfers',
  version: '1',
})
@ApiExtraModels(Transfer)
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @Get()
  @ApiResponse(responsePaginationSchema(Transfer))
  @UseInterceptors(ClassSerializerInterceptor)
  async find(@GetUser('id') userId: string, @Query() body: GetTransfersDto) {
    return await this.service.find({ ...body, userId });
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiResponse(responsePaginationSchema(Transfer))
  async findByAdmin(@Query() body: GetTransfersDto) {
    return await this.service.find(body);
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOnePublic(
    @GetUser('id') userId: string,
    @Query() dto: TransferFindOnePublicDto,
  ) {
    return await this.service.findOnePublic({ userId, ...dto });
  }

  @Post('deposit/calculate-amount')
  async calculateDepositAmount(
    @GetUser('id') userId: string,
    @Body() dto: CalculateAmountDto,
  ) {
    return await this.service.calculateAmount({
      ...dto,
      transferType: TransferTypeEnum.deposit,
      userId,
    });
  }

  @Post('withdrawal/calculate-amount')
  async calculateWithdrawalAmount(
    @GetUser('id') userId: string,
    @Body() dto: CalculateAmountDto,
  ) {
    return await this.service.calculateAmount({
      ...dto,
      transferType: TransferTypeEnum.withdrawal,
      userId,
    });
  }

  @Post('create-deposit')
  @UseInterceptors(ClassSerializerInterceptor)
  async createDeposit(
    @GetUser('id') userId: string,
    @Body(CreateDepositTransferValidation) dto: CreateDepositTransferDto,
  ) {
    return await this.service.createDeposit({ ...dto, userId });
  }

  @Post('send-withdrawal-code')
  async sendWithdrawalCode(
    @GetUser('id') userId: string,
    @Body() dto: SendWithdrawalCodeDto,
  ) {
    return await this.service.sendWithdrawalCode({ ...dto, userId });
  }

  @Post('create-withdrawal')
  @UseInterceptors(ClassSerializerInterceptor)
  async createWithdrawal(
    @GetUser('id') userId: string,
    @Body(CreateWithdrawalTransferTransform) dto: CreateWithdrawalTransferDto,
  ) {
    return await this.service.createWithdrawal({ ...dto, userId });
  }

  @Patch('cancel-deposit')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async cancelDepositTransfer(
    @GetUser('id') userId: string,
    @Body() body: CancelTransferDto,
  ) {
    return await this.service.cancelDeposit({ ...body, userId });
  }

  @Patch('cancel-withdrawal')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async cancelWithdrawalTransfer(
    @GetUser('id') userId: string,
    @Body() body: CancelTransferDto,
  ) {
    return await this.service.cancelWithdrawal({ ...body, userId });
  }

  @Patch('confirm-deposit')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async confirmDepositTransfer(
    @GetUser('id') userId: string,
    @Body() { transferId }: TransferIdDto,
  ) {
    return await this.service.confirmDeposit(transferId, userId);
  }

  @Patch('confirm-withdrawal')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async confirmWithdrawalTransfer(
    @GetUser('id') userId: string,
    @Body() { transferId }: TransferIdDto,
  ) {
    return await this.service.confirmWithdrawal(transferId, userId);
  }

  @Patch('process-deposit')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async processDepositTransfer(
    @GetUser('id') userId: string,
    @Body() body: TransferIdDto,
  ) {
    return await this.service.process({ ...body, userId });
  }

  @Patch('process-withdrawal')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  async processWithdrawalTransfer(
    @GetUser('id') userId: string,
    @Body() body: UpdateTxIdDto,
  ) {
    return await this.service.process({ ...body, userId });
  }

  @Patch('update-txid')
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@GetUser('id') userId: string, @Body() dto: UpdateTxIdDto) {
    return await this.service.updateTxId(userId, dto);
  }
}
