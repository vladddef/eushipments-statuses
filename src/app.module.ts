import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { TelegramModule } from './telegram/telegram.module';
import { EushipmentsModule } from './eushipments/eushipments.module';

@Module({
  imports: [

    TelegramModule,
    EushipmentsModule,
    // todo: add validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
