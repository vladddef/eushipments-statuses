import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { OrderLookupHandler } from './order-lookup.handler';
import { SyncNotificationHandler } from './sync-notification.handler';
import { EushipmentsModule } from '../eushipments/eushipments.module';

@Module({
  providers: [TelegramService, OrderLookupHandler, SyncNotificationHandler],
  exports: [TelegramService],
  imports: [EushipmentsModule],
})
export class TelegramModule {}
