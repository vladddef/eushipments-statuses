import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersSyncService } from './orders-sync.service';

@Injectable()
export class SyncService {
  constructor(private readonly ordersSyncService: OrdersSyncService) {}

  // @Cron(CronExpression.EVERY_30_MINUTES)
  async syncOrders() {
    await this.ordersSyncService.syncCurrent();
  }
}