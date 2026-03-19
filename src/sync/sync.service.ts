import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { OrdersSyncService } from './orders-sync.service';

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  constructor(private readonly ordersSyncService: OrdersSyncService) {}

  async onApplicationBootstrap() {
    await this.ordersSyncService.sync();
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncOrders() {
    await this.ordersSyncService.sync();
  }
}