import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SyncMetadata, SyncRun, SyncStatus } from './sync.entity';
import { OrdersService } from '../eushipments/orders.service';

export class SyncCompletedEvent {
  constructor(
    public readonly date: string,
    public readonly status: SyncStatus,
    public readonly ordersCount?: number,
    public readonly error?: string,
  ) {}
}

@Injectable()
export class OrdersSyncService {
  private readonly logger = new Logger(OrdersSyncService.name);
  private readonly syncStartDate: Date;

  constructor(
    configService: ConfigService,
    @InjectRepository(SyncRun)
    private readonly syncRunRepo: Repository<SyncRun>,
    private readonly ordersService: OrdersService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    const raw = configService.getOrThrow<string>('eushipments.syncStartDate');
    const [dd, mm, yyyy] = raw.split('/').map(Number);
    this.syncStartDate = new Date(yyyy, mm - 1, dd);
  }

  async syncFromStart(): Promise<void> {
    const alreadySynced = await this.syncRunRepo.existsBy({ status: SyncStatus.COMPLETED });
    if (alreadySynced) {
      this.logger.log('Historical sync already completed, skipping');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(this.syncStartDate);
    while (current <= today) {
      await this.syncDay(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }

  async syncCurrent(): Promise<void> {
    const now = new Date();

    // First hour of a new day — re-sync yesterday to catch any late orders
    if (now.getHours() === 0) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      await this.syncDay(yesterday);
    }

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    await this.syncDay(today);
  }

  async syncDay(date: Date): Promise<void> {
    const label = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    this.logger.log(`Syncing ${label}`);

    const { identifiers } = await this.syncRunRepo.insert({
      name: `orders_sync_${label}`,
      status: SyncStatus.RUNNING,
      startedAt: new Date(),
    });
    const runId: string = identifiers[0].id;

    let status: SyncStatus;
    let finishedAt: Date;
    let metadata: SyncMetadata;
    let error;

    try {
      const orders = await this.ordersService.getOrders(date, date);
      await this.ordersService.upsertOrders(orders);

      status = SyncStatus.COMPLETED;
      metadata = {
        date: label,
        ordersCount: orders.length,
        lastOrderId: orders.at(-1)?.SHIPMENT_NUMBER,
      };
    } catch (err) {
      status = SyncStatus.FAILED;
      metadata = { date: label, error: err?.message };
      error = err;
      this.logger.error(`Sync failed for ${label}`, err);
    }

    finishedAt = new Date();
    await this.syncRunRepo.update(runId, { status, finishedAt, metadata: metadata as any });
    this.logger.log(`Sync ${label} finished — status: ${status}`);
    this.eventEmitter.emit(
      'sync.completed',
      new SyncCompletedEvent(label, status, metadata.ordersCount, error),
    );
  }
}