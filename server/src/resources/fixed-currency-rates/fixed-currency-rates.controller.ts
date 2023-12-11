import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FixedCurrencyRatesService } from './fixed-currency-rates.service';
import { CreateFixedCurrencyRateDto } from './dto/create-fixed-currency-rate.dto';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Fixed currency rates')
@Controller({
  path: 'fixed-currency-rates',
  version: '1',
})
export class FixedCurrencyRatesController {
  constructor(private readonly service: FixedCurrencyRatesService) {}

  @Post()
  async create(@Body() dto: CreateFixedCurrencyRateDto) {
    return await this.service.create(dto);
  }
}
