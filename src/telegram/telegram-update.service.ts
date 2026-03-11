import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Message, CallbackQuery } from 'node-telegram-bot-api';
import { OrdersService } from '../eushipments/orders.service';
import { lastValueFrom } from 'rxjs';
import { TelegramService } from './telegram.service';

@Injectable()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);
  constructor(
    // private readonly ordersService: OrdersService,
    // @Inject(forwardRef(() => TelegramService))
    // private readonly telegramService: TelegramService,
  ) {}

  // ─── Text messages ────────────────────────────────────────────────────────────

  async onMessage(msg: Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text ?? '';
    const username = msg.from?.username ?? 'unknown';

    this.logger.log(`[${username}] ${text}`);

    if (text === '/start') {
      await this.handleStart(msg);
      return;
    }

    if (text === '/help') {
      await this.handleHelp(msg);
      return;
    }

    // Default echo
    await this.handleDefault(msg);
  }

  // ─── Callback queries (inline keyboard) ──────────────────────────────────────

  async onCallbackQuery(query: CallbackQuery): Promise<void> {
    const data = query.data ?? '';
    const username = query.from.username ?? 'unknown';

    this.logger.log(`[${username}] callback: ${data}`);

    // Handle button press
    if (data === 'btn_hello') {
      this.logger.log('User pressed hello button');
    }
  }

  // ─── Command handlers ─────────────────────────────────────────────────────────

  private async handleStart(msg: Message): Promise<void> {
    // Import TelegramService lazily to avoid circular dependency,
    // OR inject it here if you split the file — see README note below.
    this.logger.log(`/start from chat ${msg.chat.id}`);
  }

  private async handleHelp(msg: Message): Promise<void> {
    this.logger.log(`/help from chat ${msg.chat.id}`);
  }

  private async handleDefault(msg: Message): Promise<void> {
    // const orderId = msg.text ?? 'unknown';
    // const orderStatus = await lastValueFrom(
    //   this.ordersService.getOrder(orderId),
    // );
    // await this.telegramService.sendMessage(
    //   msg.chat.id,
    //   JSON.stringify({
    //     orderStatus,
    //     orderId: orderId,
    //   }),
    // );
    // await this.
    // await this.telegramService.sendMessage(
    //   notification.userId,
    //   JSON.stringify(orderStatus),
    // );
    this.logger.log(`Unhandled message from chat ${msg.chat.id} ${msg.text}`);
  }
}
