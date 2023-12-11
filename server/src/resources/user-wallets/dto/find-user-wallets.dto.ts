import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GetQueryDto } from '../../../types/get-query.dto';
import { IFindUserWallets } from '../../../types/user-wallet/find-user-wallets.interface';

export class FindUserWalletsDto
  extends GetQueryDto
  implements Omit<IFindUserWallets, 'userId'>
{
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  networkId?: string;
}
