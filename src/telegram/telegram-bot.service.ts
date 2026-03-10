import { Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { TelegramAuthService } from './telegram-auth.service';
import { OrdersService } from '../eushipments/orders.service';
import { TelegramNotification } from '../app.controller';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Update()
export class TelegramBotService {
  private readonly bot: Telegraf;
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: TelegramAuthService,
    private readonly ordersService: OrdersService,
  ) {
    const telegramBotToken =
      configService.get<string>('EUSHIPMENTS_TG_BOT_TOKEN') || 'undefined';
    this.bot = new Telegraf(telegramBotToken);
  }

  async order(notification: TelegramNotification) {
    // const text: string = ctx.text || 'err';
    const orderId = notification.message;

    const orderStatus = await lastValueFrom(
      this.ordersService.getOrder(orderId),
    );
    await this.bot.telegram.sendMessage(
      notification.userId,
      JSON.stringify(orderStatus),
    );
    return orderStatus;
  }
}
