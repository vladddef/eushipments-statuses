import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OrdersService {
  private apiUrl: string;
  private apiKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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
}