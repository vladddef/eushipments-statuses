import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import configuration from './config/configuration';
import {validationSchema} from './config/validation';
import {TelegramModule} from './telegram/telegram.module';
import {EushipmentsModule} from './eushipments/eushipments.module';
import {StartupService} from './startup.service';
import {SyncModule} from './sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow('db.host'),
        port: config.getOrThrow<number>('db.port'),
        username: config.getOrThrow('db.username'),
        password: config.getOrThrow('db.password'),
        database: config.getOrThrow('db.database'),
        autoLoadEntities: true,
        synchronize: config.getOrThrow<boolean>('db.sync'),
      }),
    }),
    TelegramModule,
    EushipmentsModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [StartupService],
})
export class AppModule {}
