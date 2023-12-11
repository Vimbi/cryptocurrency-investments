import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { FindInvestmentsDto } from './dto/find-investments.dto';
import { ReplenishInvestmentDto } from './dto/replenish-investment.dto';
import { CreateInvestmentValidation } from '../../validation/investments/create-investment.validation';
import { ReplenishInvestmentValidation } from '../../validation/investments/replenish-investment.validation';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { InvestmentsGetInfo } from '../../types/api-responses/investments/get-info.class';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Investments')
@Controller({
  path: 'investments',
  version: '1',
})
export class InvestmentsController {
  constructor(private readonly service: InvestmentsService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @GetUser('id') userId: string,
    @Body(CreateInvestmentValidation) dto: CreateInvestmentDto,
  ) {
    return await this.service.create({ ...dto, userId });
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async find(@GetUser('id') userId: string, @Query() dto: FindInvestmentsDto) {
    return await this.service.find({ ...dto, userId });
  }

  @Get('info')
  @ApiResponse({
    type: InvestmentsGetInfo,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async findCurrent(@GetUser('id') userId: string) {
    return await this.service.getInfo(userId);
  }

  @Patch('replenish')
  @UseInterceptors(ClassSerializerInterceptor)
  async replenish(
    @GetUser('id') userId: string,
    @Body(ReplenishInvestmentValidation) { amount }: ReplenishInvestmentDto,
  ) {
    return await this.service.replenish({ amount, userId });
  }

  @Patch('cancel')
  async cancel(@GetUser('id') userId: string) {
    return await this.service.cancel(userId);
  }
}
