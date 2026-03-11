import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [    HttpModule],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class EushipmentsModule {}
