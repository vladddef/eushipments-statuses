import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ScheduleModule} from '@nestjs/schedule';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {AdminModule} from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import {DataSource} from 'typeorm';
import {getDataSourceToken} from '@nestjs/typeorm';
import configuration from './config/configuration';
import {validationSchema} from './config/validation';
import {TelegramModule} from './telegram/telegram.module';
import {EushipmentsModule} from './eushipments/eushipments.module';
import {StartupService} from './startup.service';
import {SyncModule} from './sync/sync.module';
import {Order} from './eushipments/order.entity';
import {SyncRun} from './sync/sync.entity';

AdminJS.registerAdapter({ Resource: AdminJSTypeorm.Resource, Database: AdminJSTypeorm.Database });

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
    AdminModule.createAdminAsync({
      inject: [ConfigService, getDataSourceToken()],
      useFactory: (config: ConfigService, dataSource: DataSource) => {
        (Order as any).getRepository = () => dataSource.getRepository(Order);
        (SyncRun as any).getRepository = () => dataSource.getRepository(SyncRun);
        return {
        adminJsOptions: {
          rootPath: '/admin',
          resources: [Order, SyncRun],
        },
        auth: {
          authenticate: async (email, password) => {
            const adminEmail = config.getOrThrow<string>('admin.email');
            const adminPassword = config.getOrThrow<string>('admin.password');
            if (email === adminEmail && password === adminPassword) {
              return { email };
            }
            return null;
          },
          cookieName: 'adminjs',
          cookiePassword: config.getOrThrow<string>('admin.cookieSecret'),
        },
        sessionOptions: {
          secret: config.getOrThrow<string>('admin.cookieSecret'),
          resave: false,
          saveUninitialized: false,
        },
        };
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    TelegramModule,
    EushipmentsModule,
    SyncModule,
  ],
  controllers: [AppController],
  providers: [StartupService],
})
export class AppModule {}
