import {Controller, Get, Param, Post} from '@nestjs/common';
import {CabinetService} from "./eushipments/cabinet.service";
import {OrdersSyncService} from "./sync/orders-sync.service";

export interface TelegramNotification {
  message: string;
  userId: number;
}

@Controller()
export class AppController {
  constructor(
      private readonly cabinetService: CabinetService,
      private readonly ordersSyncService: OrdersSyncService,
  ) {}

  @Get('/')
  async getOrderStatus(@Param('id') id: string) {
    return [];
  }

  @Post('/sync')
  async syncToday() {
    await this.ordersSyncService.syncCurrent();
  }
}
