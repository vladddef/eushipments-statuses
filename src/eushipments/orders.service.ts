import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { catchError, map, throwError } from 'rxjs';

@Injectable()
export class OrdersService {
  private apiUrl: string;
  private apiKey: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiUrl =
      configService.get<string>('EUSHIPMENTS_API_URL') || 'undefined';
    const apiVersion =
      configService.get<string>('EUSHIPMENTS_API_VERSION') || 'undefined';
    this.apiKey =
      configService.get<string>('EUSHIPMENTS_API_KEY') || 'undefined';
    this.apiUrl = apiUrl + '/' + apiVersion;
  }
  getOrder(id: string) {
    return this.httpService
      .get<string>(`${this.apiUrl}/get-status/${id}`, {
        params: {
          testMode: 0,
        },
        responseType: 'json',
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      .pipe(
        map((res) => {
          return res.data;
        }),
        catchError((err) => {
          // return
          return throwError(
            () =>
              new HttpException(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                err.response?.data?.error || 'API error',
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                err.response?.status || 500,
              ),
          );
        }),
      );
  }
}
