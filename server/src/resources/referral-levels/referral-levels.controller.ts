import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReferralLevelsService } from './referral-levels.service';
import { CreateReferralLevelDto } from './dto/create-referral-level.dto';
import { UpdateReferralLevelDto } from './dto/update-referral-level.dto';
import { CreateReferralLevelValidation } from '../../validation/referral-levels/create-referral-level.validation';
import { UpdateReferralLevelValidation } from '../../validation/referral-levels/update-referral-level.validation';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Referral level')
@Controller({
  path: 'referral-levels',
  version: '1',
})
export class ReferralLevelsController {
  constructor(private readonly service: ReferralLevelsService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  async create(
    @Body(CreateReferralLevelValidation) dto: CreateReferralLevelDto,
  ) {
    return await this.service.create(dto);
  }

  @Public()
  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll() {
    return await this.service.find();
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Body(UpdateReferralLevelValidation) dto: UpdateReferralLevelDto,
  ) {
    return await this.service.update(dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  async remove(@Param('id') id: string) {
    return await this.service.delete({ id });
  }
}
