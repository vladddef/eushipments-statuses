import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import { TelegramUpdate } from './telegram-update.service';
import { OrdersService } from '../eushipments/orders.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TelegramService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
    private readonly telegramUpdate: TelegramUpdate,
    private readonly ordersService: OrdersService,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  onApplicationBootstrap() {
    const token = this.configService.getOrThrow<string>('eushipments.tgBotToken');

    // this.bot = new TelegramBot(token, { polling: true });

    // this.registerHandlers();

    this.logger.log('Telegram bot started (long polling)');
  }

  onApplicationShutdown() {
    this.bot?.stopPolling();
    this.logger.log('Telegram bot stopped');
  }

  // ─── Handlers registration ────────────────────────────────────────────────────

  private registerHandlers() {
    // All text messages
    this.bot.on('message', (msg: Message) => {
      this.handleMessage(msg);
      // this.telegramUpdate
      //   .onMessage(msg)
      //   .catch((err) => this.logger.error('onMessage error', err));
    });

    // Inline keyboard callbacks
    this.bot.on('callback_query', (query: CallbackQuery) => {
      this.telegramUpdate
        .onCallbackQuery(query)
        .catch((err) => this.logger.error('onCallbackQuery error', err));
    });

    // Polling errors
    this.bot.on('polling_error', (err) => {
      this.logger.error('Polling error', err.message);
    });
  }

  async handleMessage(msg: Message): Promise<void> {
    const orderId = msg.text || 'undefined';

    const orderStatus = await lastValueFrom(
      this.ordersService.getOrder(orderId),
    );
    await this.sendMessage(msg.chat.id, JSON.stringify(orderStatus));
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  async sendMessage(
    chatId: number | string,
    text: string,
    options?: TelegramBot.SendMessageOptions,
  ): Promise<Message> {
    return this.bot.sendMessage(chatId, text, options);
  }

  async sendPhoto(
    chatId: number | string,
    photo: string,
    options?: TelegramBot.SendPhotoOptions,
  ): Promise<Message> {
    return this.bot.sendPhoto(chatId, photo, options);
  }

  async answerCallbackQuery(
    callbackQueryId: string,
    options?: TelegramBot.AnswerCallbackQueryOptions,
  ): Promise<boolean> {
    return this.bot.answerCallbackQuery(callbackQueryId, options);
  }
}
