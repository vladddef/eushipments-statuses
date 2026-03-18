import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncRun } from './sync.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncRun])],
  exports: [TypeOrmModule],
})
export class SyncModule {}