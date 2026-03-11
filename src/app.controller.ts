import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './eushipments/orders.service';
import { Observable } from 'rxjs';
import { TelegramBotService } from './telegram/telegram-bot.service';

export interface TelegramNotification {
  message: string;
  userId: number;
}

@Controller()
export class AppController {
  // constructor(
  //   private readonly ordersService: OrdersService,
  //   private readonly telegramBotService: TelegramBotService,
  // ) {}
  //
  // @Get('orders/:id')
  // getOrderStatus(@Param('id') id: string): Observable<any> {
  //   return this.ordersService.getOrder(id);
  // }
  //
  // @Post('/message')
  // handleBotMessage(@Body() notification: TelegramNotification) {
  //   return this.telegramBotService.order(notification);
  // }
}
