import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncRun } from './sync.entity';
import { SyncService } from './sync.service';
import { EushipmentsModule } from '../eushipments/eushipments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncRun]),
    EushipmentsModule,
  ],
  providers: [SyncService],
})
export class SyncModule {}