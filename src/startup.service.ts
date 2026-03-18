import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(private readonly telegram: TelegramService) {}

  onApplicationBootstrap() {
    this.telegram.start();
  }

  onApplicationShutdown() {
    this.telegram.stop();
  }
}