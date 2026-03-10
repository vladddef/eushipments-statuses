import { Injectable } from '@nestjs/common';
import { MANAGERS } from './managers';

@Injectable()
export class TelegramAuthService {
  isManager(id: number) {
    return MANAGERS.includes(id);
  }
}
