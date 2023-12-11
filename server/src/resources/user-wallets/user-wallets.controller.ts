import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserWalletsService } from './user-wallets.service';
import { CreateUserWalletDto } from './dto/create-user-wallet.dto';
import { GetUser } from '../../utils/custom-decorators/get-user.decorator';
import { FindUserWalletsDto } from './dto/find-user-wallets.dto';
import { UserWallet } from './entities/user-wallet.entity';
import { responsePaginationSchema } from '../../utils/response-pagination-schema';
import { JwtTwoFactorGuard } from '../auth/guards/jwt-two-factor.guard';

@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard)
@ApiTags('User wallets')
@Controller({
  path: 'user-wallets',
  version: '1',
})
@ApiExtraModels(UserWallet)
export class UserWalletsController {
  constructor(private readonly service: UserWalletsService) {}

  @Post()
  @ApiResponse({ type: UserWallet })
  async create(
    @GetUser('id') userId: string,
    @Body() dto: CreateUserWalletDto,
  ) {
    return await this.service.create({ ...dto, userId });
  }

  @Get()
  @ApiResponse(responsePaginationSchema(UserWallet))
  async find(@GetUser('id') userId: string, @Query() body: FindUserWalletsDto) {
    return await this.service.find({ ...body, userId });
  }

  @Delete(':id')
  async remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return await this.service.delete({ userId, id });
  }
}
