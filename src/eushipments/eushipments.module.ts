import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CabinetService } from './cabinet.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [OrdersService, CabinetService],
  exports: [OrdersService, CabinetService],
})
export class EushipmentsModule {}
