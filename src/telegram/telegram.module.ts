import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram-update.service';
import { EushipmentsModule } from '../eushipments/eushipments.module';

@Module({
  providers: [TelegramService, TelegramUpdate],
  exports: [TelegramService],
  imports: [EushipmentsModule],
})
export class TelegramModule {}
