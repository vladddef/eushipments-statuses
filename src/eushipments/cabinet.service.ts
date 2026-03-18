import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {HttpService} from '@nestjs/axios';


@Injectable()
export class CabinetService {
    private readonly logger = new Logger(CabinetService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
    }


    async getOrders(startDate: string, endDate: string) {

    }

}