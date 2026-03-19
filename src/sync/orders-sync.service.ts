import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncRun, SyncStatus } from './sync.entity';
import { OrdersService } from '../eushipments/orders.service';

@Injectable()
export class OrdersSyncService {
  private readonly logger = new Logger(OrdersSyncService.name);
  private readonly syncStartDate: Date;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SyncRun)
    private readonly syncRunRepo: Repository<SyncRun>,
    private readonly ordersService: OrdersService,
  ) {
    const raw = this.configService.getOrThrow<string>('eushipments.syncStartDate');
    const [dd, mm, yyyy] = raw.split('/').map(Number);
    this.syncStartDate = new Date(yyyy, mm - 1, dd);
  }

  async sync() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(this.syncStartDate);

    while (current <= today) {
      const day = new Date(current);
      await this.syncDay(day);
      current.setDate(current.getDate() + 1);
    }
  }

  private async syncDay(date: Date) {
    const label = date.toISOString().slice(0, 10);
    this.logger.log(`Syncing ${label}`);

    const run = await this.syncRunRepo.save(
      this.syncRunRepo.create({
        name: `orders_sync_${label}`,
        status: SyncStatus.RUNNING,
        startedAt: new Date(),
      }),
    );

    try {
      const orders = await this.ordersService.getOrders(date, date);
      await this.ordersService.upsertOrders(orders);

      run.status = SyncStatus.COMPLETED;
      run.finishedAt = new Date();
      run.metadata = {
        date: label,
        ordersCount: orders.length,
        lastOrderId: orders.at(-1)?.SHIPMENT_NUMBER,
      };
    } catch (err) {
      run.status = SyncStatus.FAILED;
      run.finishedAt = new Date();
      run.metadata = { date: label, error: err?.message };
      this.logger.error(`Sync failed for ${label}`, err);
    }

    await this.syncRunRepo.save(run);
    this.logger.log(`Sync ${label} finished — status: ${run.status}`);
  }
}