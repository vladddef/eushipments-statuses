import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import { OrderLookupHandler } from './order-lookup.handler';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot;

  constructor(
    private readonly configService: ConfigService,
    private readonly orderLookupHandler: OrderLookupHandler,
  ) {}

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

  private registerHandlers() {
    this.bot.on('message', (msg: Message) => {
      this.orderLookupHandler
        .handle(msg, (chatId, text) => this.sendMessage(chatId, text).then(() => undefined))
        .catch((err) => this.logger.error('handleMessage error', err));
    });

    this.bot.on('polling_error', (err) => {
      this.logger.error('Polling error', err.message);
    });
  }

  async sendMessage(
    chatId: number | string,
    text: string,
    options?: TelegramBot.SendMessageOptions,
  ): Promise<Message> {
    return this.bot.sendMessage(chatId, text, options);
  }
}