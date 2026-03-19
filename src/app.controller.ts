import {Controller, Get, Param} from '@nestjs/common';
import {CabinetService} from "./eushipments/cabinet.service";

export interface TelegramNotification {
  message: string;
  userId: number;
}

@Controller()
export class AppController {
  constructor(
      private readonly cabinetService: CabinetService
  ) {}

  @Get('/')
  async getOrderStatus(@Param('id') id: string) {
    return [];
  }
}
