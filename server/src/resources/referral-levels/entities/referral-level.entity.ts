import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityHelper } from '../../../utils/entity-helper';
import { Transform } from 'class-transformer';
import { convertNumberToPercentage } from '../../../utils/convert-number-to-percentage';

@Entity('referralLevel')
@Check('level >= 1 AND level <= 10')
@Check('percentage > 0 AND percentage < 10000')
export class ReferralLevel extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', nullable: false, unique: true })
  level: number;

  @Column({ type: 'integer', nullable: false })
  @Transform(({ value }) => convertNumberToPercentage(value))
  percentage: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  status: boolean;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'now()',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date | null;
}
