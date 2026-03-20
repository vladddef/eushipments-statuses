import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { EushipmentsModule } from '../eushipments/eushipments.module';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [EushipmentsModule],
})
export class TelegramModule {}
