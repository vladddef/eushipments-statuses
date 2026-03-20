import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';
import { OrdersSyncService } from './sync/orders-sync.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private readonly telegram: TelegramService,
    private readonly ordersSyncService: OrdersSyncService,
  ) {}

  async onApplicationBootstrap() {
    // this.telegram.start();
    // await this.ordersSyncService.syncFromStart();
  }

  onApplicationShutdown() {
    // this.telegram.stop();
  }
}