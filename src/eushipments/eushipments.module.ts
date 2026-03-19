import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { OrdersService } from './orders.service';
import { CabinetService } from './cabinet.service';
import { EushipmentsApiService } from './eushipments-api.service';
import { Order } from './order.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Order])],
  providers: [OrdersService, CabinetService, EushipmentsApiService],
  exports: [OrdersService, CabinetService, EushipmentsApiService, TypeOrmModule],
})
export class EushipmentsModule {}