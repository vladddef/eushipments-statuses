import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Order } from './order.entity';
import { CabinetOrder, CabinetService } from './cabinet.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly cabinetService: CabinetService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getOrders(startDate?: Date, endDate?: Date): Promise<CabinetOrder[]> {
    return this.cabinetService.getOrders(startDate, endDate);
  }

  async upsertOrders(rows: CabinetOrder[]): Promise<void> {
    const orders = rows
      .filter((row) => row.SHIPMENT_NUMBER)
      .map((row) => ({
        abw_number: row.SHIPMENT_NUMBER,
        sender_id: row.C_NAME,
        reference_number: row.REFERENCE_NUMBER,
        recipient_name: row.RECIPIENT,
        phone_number: row.OP_PHONENUMBER || null,
        city_name: row.CITY_NAME,
        cod: row.COD || null,
        awb_status: row.STATUS_TEXT,
      }));

    await this.orderRepo.upsert(orders, ['abw_number']);
  }

  async findByPhone(phone: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { phone_number: ILike(`%${phone}%`) },
      order: { abw_number: 'DESC' },
    });
  }

  async findByName(name: string): Promise<Order | null> {
    return this.orderRepo.findOne({
      where: { recipient_name: ILike(`%${name}%`) },
      order: { abw_number: 'DESC' },
    });
  }

  async findByAbwNumber(abwNumber: string): Promise<Order | null> {
    return this.orderRepo.findOneBy({ abw_number: abwNumber });
  }
}