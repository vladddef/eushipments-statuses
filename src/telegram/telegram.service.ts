import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import { TelegramUpdate } from './telegram-update.service';
import { OrdersService } from '../eushipments/orders.service';
import { EushipmentsApiService } from '../eushipments/eushipments-api.service';
import { Order } from '../eushipments/order.entity';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
    private readonly telegramUpdate: TelegramUpdate,
    private readonly ordersService: OrdersService,
    private readonly apiService: EushipmentsApiService,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────────

  start() {
    const token = this.configService.getOrThrow<string>('eushipments.tgBotToken');

    this.bot = new TelegramBot(token, { polling: true });
    this.registerHandlers();

    this.logger.log('Telegram bot started (long polling)');
  }

  stop() {
    this.bot?.stopPolling();
    this.logger.log('Telegram bot stopped');
  }

  // ─── Handlers registration ────────────────────────────────────────────────────

  private registerHandlers() {
    // All text messages
    this.bot.on('message', (msg: Message) => {
      this.handleMessage(msg).catch((err) =>
        this.logger.error('handleMessage error', err),
      );
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
    const text = (msg.text ?? '').trim();
    if (!text || text.startsWith('/')) return;

    const chatId = msg.chat.id;

    const digitsOnly = /^\d{7,}$/.test(text);
    const looksLikePhone = /^[+\d][\d\s\-().]{5,}$/.test(text);
    const digits = text.replace(/\D/g, '');
    const letters = text.replace(/[^a-zA-ZÀ-žА-я]/g, '');

    let order: Order | null;
    let searchType: string;

    if (digitsOnly) {
      order = await this.ordersService.findByAbwNumber(text);
      if (order) {
        searchType = 'AWB number';
      } else {
        if (digits.length < 10) {
          await this.sendMessage(chatId, 'Phone number must be at least 10 digits.');
          return;
        }
        order = await this.ordersService.findByPhone(text);
        searchType = 'phone';
      }
    } else if (looksLikePhone) {
      if (digits.length < 10) {
        await this.sendMessage(chatId, 'Phone number must be at least 10 digits.');
        return;
      }
      order = await this.ordersService.findByPhone(text);
      searchType = 'phone';
    } else {
      if (letters.length < 5) {
        await this.sendMessage(chatId, 'Name must be at least 5 letters.');
        return;
      }
      order = await this.ordersService.findByName(text);
      searchType = 'recipient name';
    }

    if (!order) {
      await this.sendMessage(chatId, `No orders found by ${searchType}: "${text}"`);
      return;
    }

    const liveStatus = await this.apiService.getOrderStatus(order.abw_number);
    await this.sendMessage(chatId, this.formatOrder(order, liveStatus?.status));
  }

  private formatOrder(order: Order, liveStatus?: any): string {
    const lines = [
      `📦 AWB: ${order.abw_number}`,
      `Recipient: ${order.recipient_name}`,
      `Phone: ${order.phone_number ?? '—'}`,
      `City: ${order.city_name}`,
    ];
    if (liveStatus) lines.push(`Live status: ${liveStatus}`);
    return lines.join('\n');
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
