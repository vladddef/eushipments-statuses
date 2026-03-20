import { Injectable } from '@nestjs/common';
import { Message } from 'node-telegram-bot-api';
import { OrdersService } from '../eushipments/orders.service';
import { EushipmentsApiService } from '../eushipments/eushipments-api.service';
import { Order } from '../eushipments/order.entity';
import { TelegramService } from './telegram.service';

@Injectable()
export class OrderLookupHandler {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly apiService: EushipmentsApiService,
    private readonly telegramService: TelegramService,
  ) {}

  async handle(msg: Message): Promise<void> {
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
          await this.telegramService.sendMessage(chatId, 'Phone number must be at least 10 digits.');
          return;
        }
        order = await this.ordersService.findByPhone(text);
        searchType = 'phone';
      }
    } else if (looksLikePhone) {
      if (digits.length < 10) {
        await this.telegramService.sendMessage(chatId, 'Phone number must be at least 10 digits.');
        return;
      }
      order = await this.ordersService.findByPhone(text);
      searchType = 'phone';
    } else {
      if (letters.length < 5) {
        await this.telegramService.sendMessage(chatId, 'Name must be at least 5 letters.');
        return;
      }
      order = await this.ordersService.findByName(text);
      searchType = 'recipient name';
    }

    if (!order) {
      await this.telegramService.sendMessage(chatId, `No orders found by ${searchType}: "${text}"`);
      return;
    }

    const liveStatus = await this.apiService.getOrderStatus(order.abw_number);
    await this.telegramService.sendMessage(chatId, this.formatOrder(order, liveStatus?.status));
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
}