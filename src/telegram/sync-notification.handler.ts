import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { SyncCompletedEvent } from '../sync/orders-sync.service';
import { SyncStatus } from '../sync/sync.entity';
import { TelegramService } from './telegram.service';

@Injectable()
export class SyncNotificationHandler {
  private readonly adminUserId: number;

  constructor(
    configService: ConfigService,
    private readonly telegramService: TelegramService,
  ) {
    this.adminUserId = configService.getOrThrow<number>('eushipments.tgAdminUserId');
  }

  @OnEvent('sync.completed')
  async handle(event: SyncCompletedEvent): Promise<void> {
    const icon = event.status === SyncStatus.COMPLETED ? '✅' : '❌';
    const lines = [`${icon} Sync ${event.date} — ${event.status}`];
    if (event.ordersCount !== undefined) lines.push(`Orders: ${event.ordersCount}`);
    if (event.error) lines.push(`Error: ${event.error}`);

    await this.telegramService.sendMessage(this.adminUserId, lines.join('\n'));
  }
}