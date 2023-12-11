import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { SHORT_LENGTH } from '../../../utils/constants/common-constants';
import { ArticleFile } from '../../article-files/entities/article-file.entity';
import { RaffleFile } from '../../raffle-files/entities/raffle-file.entity';
import { ArticleTypeLocaleContent } from '../../article-type-locale-content/entities/article-type-locale-content.entity';
import { ArticleLocaleContent } from '../../article-locale-content/entities/article-locale-content.entity';
import { RaffleLocaleContent } from '../../raffles-local-content/entities/raffle-locale-content.entity';
import { ProductLocaleContent } from '../../products-locale-content/entities/product-locale-content.entity';
import { TransactionTypeLocaleContent } from '../../transaction-types-locale-content/entities/transaction-type-locale-content.entity';
import { TransferTypeLocaleContent } from '../../transfer-types-locale-content/entities/transfer-type-locale-content.entity';
import { TransferStatusLocaleContent } from '../../transfer-statuses-locale-content/entities/transfer-statuses-locale-content.entity';

@Entity()
export class Locale extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: SHORT_LENGTH,
    unique: true,
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: SHORT_LENGTH,
    unique: true,
  })
  displayName: string;

  @ApiProperty()
  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @ApiHideProperty()
  @OneToMany(
    () => ArticleLocaleContent,
    (articleLocaleContent) => articleLocaleContent.locale,
  )
  articlesLocaleContent: ArticleLocaleContent[];

  @ApiHideProperty()
  @OneToMany(
    () => ArticleTypeLocaleContent,
    (articleTypeLocaleContent) => articleTypeLocaleContent.locale,
  )
  articleTypesLocaleContent: ArticleTypeLocaleContent[];

  @ApiHideProperty()
  @OneToMany(
    () => RaffleLocaleContent,
    (raffleLocaleContent) => raffleLocaleContent.locale,
  )
  rafflesLocaleContent: RaffleLocaleContent[];

  @ApiHideProperty()
  @OneToMany(
    () => ProductLocaleContent,
    (productLocaleContent) => productLocaleContent.locale,
  )
  productsLocaleContent: ProductLocaleContent[];

  @ApiHideProperty()
  @OneToMany(
    () => TransferTypeLocaleContent,
    (transferTypesLocaleContent) => transferTypesLocaleContent.locale,
  )
  transferTypesLocaleContent: TransferTypeLocaleContent[];

  @ApiHideProperty()
  @OneToMany(
    () => TransferStatusLocaleContent,
    (transferStatusLocaleContent) => transferStatusLocaleContent.locale,
  )
  transferStatusesLocaleContent: TransferStatusLocaleContent[];

  @ApiHideProperty()
  @OneToMany(
    () => TransactionTypeLocaleContent,
    (transactionTypesLocaleContent) => transactionTypesLocaleContent.locale,
  )
  transactionTypesLocaleContent: TransactionTypeLocaleContent[];

  @ApiHideProperty()
  @OneToMany(() => ArticleFile, (articleFile) => articleFile.locale)
  articleFiles: ArticleFile[];

  @ApiHideProperty()
  @OneToMany(() => RaffleFile, (raffleFile) => raffleFile.locale)
  raffleFiles: RaffleFile[];
}
