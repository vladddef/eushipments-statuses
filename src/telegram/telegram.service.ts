import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import { TelegramUpdate } from './telegram-update.service';
import { OrdersService } from '../eushipments/orders.service';
import { Order } from '../eushipments/order.entity';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
    private readonly telegramUpdate: TelegramUpdate,
    private readonly ordersService: OrdersService,
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

    // Detect input type:
    // - Pure digits 7+ chars → try AWB number first, then phone
    // - Starts with + or contains only digits/spaces/dashes → phone search
    // - Otherwise → name search
    const digitsOnly = /^\d{7,}$/.test(text);
    const looksLikePhone = /^[+\d][\d\s\-().]{5,}$/.test(text);

    let orders: Order[] = [];
    let searchType: string;

    if (digitsOnly) {
      const byAbw = await this.ordersService.findByAbwNumber(text);
      if (byAbw) {
        orders = [byAbw];
        searchType = 'AWB number';
      } else {
        orders = await this.ordersService.findByPhone(text);
        searchType = 'phone';
      }
    } else if (looksLikePhone) {
      orders = await this.ordersService.findByPhone(text);
      searchType = 'phone';
    } else {
      orders = await this.ordersService.findByName(text);
      searchType = 'recipient name';
    }

    if (orders.length === 0) {
      await this.sendMessage(chatId, `No orders found by ${searchType}: "${text}"`);
      return;
    }

    for (const order of orders.slice(0, 10)) {
      await this.sendMessage(chatId, this.formatOrder(order));
    }

    if (orders.length > 10) {
      await this.sendMessage(chatId, `... and ${orders.length - 10} more results.`);
    }
  }

  private formatOrder(order: Order): string {
    const lines = [
      `📦 AWB: ${order.abw_number}`,
      `Recipient: ${order.recipient_name}`,
      `Phone: ${order.phone_number ?? '—'}`,
      `City: ${order.city_name}`,
      `Status: ${order.awb_status}`,
    ];
    if (order.cod) lines.push(`COD: ${order.cod}`);
    if (order.reference_number) lines.push(`Ref: ${order.reference_number}`);
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
