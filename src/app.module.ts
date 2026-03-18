import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule} from '@nestjs/config';
import configuration from './config/configuration';
import {validationSchema} from './config/validation';
import {TelegramModule} from './telegram/telegram.module';
import {EushipmentsModule} from './eushipments/eushipments.module';
import {StartupService} from './startup.service';

@Module({
  imports: [
    TelegramModule,
    EushipmentsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      validationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [StartupService],
})
export class AppModule {}
