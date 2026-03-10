import { Injectable } from '@nestjs/common';
import { MANAGERS } from './managers';

@Injectable()
export class AuthService {
  isManager(id: number) {
    return MANAGERS.includes(id);
  }
}
