import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RafflesService } from './raffles.service';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { FindRafflesDto } from './dto/find-raffles.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { CreateRaffleValidation } from '../../validation/raffles/create-raffle.validation';
import { UpdateRaffleValidation } from '../../validation/raffles/update-raffle.validation';
import { FindRaffleDto } from './dto/find-raffle.dto';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Raffles')
@Controller({
  path: 'raffles',
  version: '1',
})
export class RafflesController {
  constructor(private readonly service: RafflesService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  @Post()
  async create(@Body(CreateRaffleValidation) dto: CreateRaffleDto) {
    return await this.service.create(dto);
  }

  @Public()
  @Get()
  async find(@Query() dto: FindRafflesDto) {
    return await this.service.find({ ...dto, isPublished: true });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.superAdmin)
  @Get('admin')
  async findAll(@Query() dto: FindRafflesDto) {
    return await this.service.find(dto);
  }

  @Public()
  @Get('one')
  async findOne(@GetUser('id') userId: string, @Query() dto: FindRaffleDto) {
    return await this.service.findOnePublic({
      userId,
      dto,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.superAdmin)
  @Patch()
  async update(@Body(UpdateRaffleValidation) dto: UpdateRaffleDto) {
    return await this.service.update(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin, RoleEnum.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
