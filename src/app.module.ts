import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { OrdersService } from './eushipments/orders.service';

@Module({
  imports: [
    // todo: add validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [OrdersService],
})
export class AppModule {}
