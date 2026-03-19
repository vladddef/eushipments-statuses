import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { of } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { Order } from './order.entity';

// Column indices in the raw orders.json rows
const COL_ABW_NUMBER = 2;
const COL_SENDER_ID = 4;
const COL_REFERENCE_NUMBER = 13;
const COL_RECIPIENT_NAME = 14;
const COL_PHONE_NUMBER = 15;
const COL_CITY_NAME = 17;
const COL_COD = 20;
const COL_AWB_STATUS = 34;

@Injectable()
export class OrdersService {
  private apiUrl: string;
  private apiKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    const apiUrl = configService.getOrThrow<string>('eushipments.apiUrl');
    const apiVersion = configService.getOrThrow<string>('eushipments.apiVersion');
    this.apiKey = configService.getOrThrow<string>('eushipments.apiKey');
    this.apiUrl = apiUrl + '/' + apiVersion;
  }

  getOrders() {
    const raw: string[][] = JSON.parse(
      fs.readFileSync(path.resolve('orders.json'), 'utf-8'),
    );
    const rows = raw.slice(3, raw.length - 2);
    return of(rows);
  }

  async upsertOrders(rows: string[][]): Promise<void> {
    const orders = rows
      .filter((row) => row[COL_ABW_NUMBER])
      .map((row) => ({
        abw_number: row[COL_ABW_NUMBER],
        sender_id: row[COL_SENDER_ID],
        reference_number: row[COL_REFERENCE_NUMBER],
        recipient_name: row[COL_RECIPIENT_NAME],
        phone_number: row[COL_PHONE_NUMBER] || null,
        city_name: row[COL_CITY_NAME],
        cod: row[COL_COD] || null,
        awb_status: row[COL_AWB_STATUS],
      }));

    await this.orderRepo.upsert(orders, ['abw_number']);
  }

  async findByPhone(phone: string): Promise<Order[]> {
    return this.orderRepo.findBy({ phone_number: ILike(`%${phone}%`) });
  }

  async findByName(name: string): Promise<Order[]> {
    return this.orderRepo.findBy({ recipient_name: ILike(`%${name}%`) });
  }

  async findByAbwNumber(abwNumber: string): Promise<Order | null> {
    return this.orderRepo.findOneBy({ abw_number: abwNumber });
  }
}