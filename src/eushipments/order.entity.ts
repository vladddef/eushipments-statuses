import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  abw_number: string;

  @Column({ type: 'varchar' })
  awb_status: string;

  @Column({ type: 'varchar' })
  recipient_name: string;

  @Column({ type: 'varchar' })
  reference_number: string;

  @Column({ type: 'varchar' })
  sender_id: string;

  @Column({ type: 'varchar' })
  city_name: string;

  @Column({ type: 'varchar', nullable: true })
  street_name: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string | null;

  @Column({ type: 'int', default: 1 })
  parcels: number;

  @Column({ type: 'varchar', nullable: true })
  cod: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
