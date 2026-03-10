import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './eushipments/orders.service';

@Controller()
export class AppController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getHello(): string {
    return this.ordersService.getOrder('1');
  }
}
