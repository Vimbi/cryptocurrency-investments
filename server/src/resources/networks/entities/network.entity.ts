import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Currency } from '../../currencies/entities/currency.entity';
import { UserWallet } from '../../user-wallets/entities/user-wallet.entity';
import { FixedCurrencyRate } from '../../fixed-currency-rates/entities/fixed-currency-rate.entity';
import { Transfer } from '../../transfers/entities/transfer.entity';
import { NetworkTokenTypeEnum } from '../network-token-type.enum';

@Entity()
@Unique(['currencyId', 'displayName'])
@Unique(['currencyId', 'tokenType'])
export class Network extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  currencyId: string;

  @ManyToOne(() => Currency, (currency) => currency.networks)
  @JoinColumn({ name: 'currencyId' })
  currency: Currency;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  displayName: string;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  depositAddress: string;

  @Column({
    type: 'character varying',
    length: SHORT_LENGTH,
    nullable: false,
  })
  tokenType: NetworkTokenTypeEnum;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date | null;

  @ApiHideProperty()
  @OneToMany(() => UserWallet, (userWallet) => userWallet.network)
  userWallets: UserWallet[];

  @ApiHideProperty()
  @OneToMany(
    () => FixedCurrencyRate,
    (fixedCurrencyRate) => fixedCurrencyRate.network,
  )
  fixedCurrencyRates: FixedCurrencyRate[];

  @ApiHideProperty()
  @OneToMany(() => Transfer, (transfer) => transfer.network)
  transfers: Transfer[];
}
