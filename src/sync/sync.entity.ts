import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SyncStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface SyncMetadata {
  ordersCount?: number;
  lastOrderId?: string;
  [key: string]: unknown;
}

@Entity('sync_runs')
export class SyncRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: SyncStatus, default: SyncStatus.RUNNING })
  status: SyncStatus;

  @Column({ type: 'timestamptz', name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'finished_at' })
  finishedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: SyncMetadata | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'notified_at' })
  notifiedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
