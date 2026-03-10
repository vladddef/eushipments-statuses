import { Controller, Get, Param } from '@nestjs/common';
import { OrdersService } from './eushipments/orders.service';
import { Observable } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders/:id')
  getOrderStatus(@Param('id') id: string): Observable<string> {
    return this.ordersService.getOrder(id);
  }
}
