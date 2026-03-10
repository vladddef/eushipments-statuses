import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  private apiUrl: string;
  constructor(private readonly configService: ConfigService) {
    const apiUrl =
      configService.get<string>('EUSHIPMENTS_API_URL') || 'undefined';
    const apiVersion =
      configService.get<string>('EUSHIPMENTS_API_VERSION') || 'undefined';
    this.apiUrl = apiUrl + '/' + apiVersion;
  }
  getOrder(id: string) {
    // const res = await axios.get(`https://api.site.com/orders/${id}`, {
    //   headers: {
    //     Authorization: 'Bearer API_KEY',
    //   },
    // });

    return 'res.data';
  }
}
