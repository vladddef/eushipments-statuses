import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncRun, SyncStatus } from './sync.entity';
import { OrdersService } from '../eushipments/orders.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(SyncRun)
    private readonly syncRunRepo: Repository<SyncRun>,
    private readonly ordersService: OrdersService,
  ) {}

  async onApplicationBootstrap() {
    // const hasRun = await this.syncRunRepo.existsBy({ status: SyncStatus.COMPLETED });
    // if (!hasRun) {
    //   this.logger.log('No previous sync found — running initial sync');
      await this.sync();
    // }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sync() {
    this.logger.log('Starting sync run');

    const run = await this.syncRunRepo.save(
      this.syncRunRepo.create({
        name: 'orders_sync',
        status: SyncStatus.RUNNING,
        startedAt: new Date(),
      }),
    );

    try {
      const orders = await lastValueFrom(this.ordersService.getOrders());

      run.status = SyncStatus.COMPLETED;
      run.finishedAt = new Date();
      run.metadata = {
        ordersCount: orders.length,
        lastOrderId: orders.at(-1)?.[2],
      };
    } catch (err) {
      run.status = SyncStatus.FAILED;
      run.finishedAt = new Date();
      run.metadata = { error: err?.message };
      this.logger.error('Sync failed', err);
    }

    await this.syncRunRepo.save(run);
    this.logger.log(`Sync finished — status: ${run.status}`);
  }
}