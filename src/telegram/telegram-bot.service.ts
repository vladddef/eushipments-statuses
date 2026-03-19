import { Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegramAuthService } from './telegram-auth.service';
import { OrdersService } from '../eushipments/orders.service';
import { TelegramNotification } from '../app.controller';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramBotService {
  private readonly bot: Telegraf;
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: TelegramAuthService,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {
    const telegramBotToken = configService.getOrThrow<string>('eushipments.tgBotToken');
    this.bot = new Telegraf(telegramBotToken);
  }

  async order(notification: TelegramNotification) {
    const orderId = notification.message;

    const orderStatus = await this.ordersService.getOrders();
    await this.telegramService.sendMessage(
      notification.userId,
      JSON.stringify(orderStatus),
    );
    return orderStatus;
  }
}
