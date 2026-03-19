import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EushipmentsApiService {
  private readonly logger = new Logger(EushipmentsApiService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(configService: ConfigService, private readonly httpService: HttpService) {
    const base = configService.getOrThrow<string>('eushipments.apiUrl');
    const version = configService.getOrThrow<string>('eushipments.apiVersion');
    this.apiKey = configService.getOrThrow<string>('eushipments.apiKey');
    this.apiUrl = `${base}/${version}`;
  }

  async getOrderStatus(abwNumber: string): Promise<any> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/get-status/${abwNumber}`, {
          params: { testMode: 0 },
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }),
      );
      return res.data;
    } catch (err) {
      this.logger.error(`Failed to fetch status for ${abwNumber}`, err?.message);
      return null;
    }
  }
}