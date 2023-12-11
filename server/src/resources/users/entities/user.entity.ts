import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  AVERAGE_LENGTH,
  SHORT_LENGTH,
  LONG_LENGTH,
} from '../../../utils/constants/common-constants';
import { Role } from '../../roles/entities/role.entity';
import { UserStatus } from '../../user-statuses/entities/user-status.entity';
import { encryptPassword } from '../../../utils/encrypt-password';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Investment } from '../../investments/entities/investment.entity';

@Entity()
export class User extends EntityHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional()
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => User, (parent) => parent.children)
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @OneToMany(() => User, (child) => child.parent)
  children: User[];

  @ApiPropertyOptional()
  @Column({
    type: 'character varying',
    nullable: true,
    length: SHORT_LENGTH,
    unique: true,
  })
  phone: string | null;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: SHORT_LENGTH,
    unique: true,
  })
  email: string;

  // @Column({ type: 'boolean', nullable: false, default: false })
  // isEmailConfirmed: boolean;

  @Column({ type: 'character varying', nullable: false, length: LONG_LENGTH })
  password: string;

  @BeforeInsert()
  async setPassword() {
    if (this.password) {
      this.password = await encryptPassword(this.password);
    }
  }

  @ApiProperty()
  @Column({ type: 'character varying', nullable: false, length: SHORT_LENGTH })
  firstName: string;

  @ApiProperty()
  @Column({
    type: 'character varying',
    nullable: false,
    length: SHORT_LENGTH,
  })
  lastName: string;

  @ApiProperty()
  @Column({ type: 'character varying', nullable: false, length: SHORT_LENGTH })
  surname: string;

  @Column({ type: 'character varying', nullable: true, length: SHORT_LENGTH })
  code: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  codeSendedAt: Date | null;

  @Column({ type: 'character varying', nullable: true })
  hash: string | null;

  @Column({ type: 'character varying', nullable: false, unique: true })
  referralCode: string;

  @ApiPropertyOptional()
  @Column({ type: 'character varying', nullable: true, length: AVERAGE_LENGTH })
  refreshToken: string | null;

  @Column({ type: 'uuid', nullable: false })
  roleId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ type: 'uuid', nullable: false })
  statusId: string;

  @ManyToOne(() => UserStatus)
  @JoinColumn({ name: 'statusId' })
  status: UserStatus;

  @Column({ type: 'bigint', nullable: true })
  telegramChatId: string;

  @Column({ type: 'boolean', default: false })
  isTwoFactorAuthenticationEnabled: boolean;

  investmentsAmount: number;

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
  updatedAt?: Date | null;

  @ApiPropertyOptional()
  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt?: Date | null;

  @OneToMany(() => Investment, (investment) => investment.user)
  investments: Investment[];
}
