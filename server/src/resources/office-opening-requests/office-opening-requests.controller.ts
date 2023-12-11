import {
  Controller,
  Get,
  UseGuards,
  Query,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetQueryDto } from '../../types/get-query.dto';
import { responsePaginationSchema } from '../../utils/response-pagination-schema';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { DeleteOfficeOpeningRequestsDto } from './dto/delete-office-opening-requests.dto';
import { OfficeOpeningRequest } from './entities/office-opening-request.entity';
import { OfficeOpeningRequestsService } from './office-opening-requests.service';
import { Public } from '../../utils/custom-decorators/public.decorator';
import { CreateOfficeOpeningRequestDto } from './dto/create-office-opening-request.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('OfficeOpeningRequests')
@Controller({
  path: 'office-opening-requests',
  version: '1',
})
@ApiExtraModels(OfficeOpeningRequest)
export class OfficeOpeningRequestsController {
  constructor(private readonly service: OfficeOpeningRequestsService) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateOfficeOpeningRequestDto) {
    return await this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Get()
  @ApiResponse(responsePaginationSchema(OfficeOpeningRequest))
  async find(@Query() query: GetQueryDto) {
    return await this.service.find(query);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Delete()
  async delete(@Body() { ids }: DeleteOfficeOpeningRequestsDto) {
    return await this.service.delete(ids);
  }
}
