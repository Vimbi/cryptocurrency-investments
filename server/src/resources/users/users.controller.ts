import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUsersByUserDto } from './dto/get-users-by-user.dto';
import { responsePaginationSchema } from '../../utils/response-pagination-schema';
import { User } from './entities/user.entity';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Post()
  async create(@Body() createProfileDto: CreateUserDto) {
    return await this.usersService.create(createProfileDto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  @ApiResponse(responsePaginationSchema(User))
  @Get()
  async find(@GetUser('id') userId: string, @Query() dto: GetUsersDto) {
    return await this.usersService.find(userId, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin, RoleEnum.admin)
  @Get('all')
  @ApiResponse(responsePaginationSchema(User))
  async all() {
    return await this.usersService.findAll();
  }

  @Get('team')
  @ApiResponse(responsePaginationSchema(User))
  async findByUser(
    @GetUser('id') userId: string,
    @Query() dto: GetUsersByUserDto,
  ) {
    return await this.usersService.findByUser(userId, dto);
  }

  @Get('whole-team')
  @ApiResponse(responsePaginationSchema(User))
  async findWholeTeam(@GetUser('id') userId: string) {
    return await this.usersService.findWholeTeam(userId);
  }

  @Get(':id')
  @ApiResponse({ type: User })
  async findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.usersService.findOnePublic(userId, { id });
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Patch(':id/super-admin')
  @ApiResponse({ type: User })
  async updateBySuperAdmin(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return await this.usersService.update({ id }, updateProfileDto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.superAdmin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.softDelete(id);
  }
}
