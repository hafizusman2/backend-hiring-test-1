import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Call } from './call.entity';
import { CallService } from './call.service';
import { CallController } from './call.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Call])],
  providers: [CallService],
  controllers: [CallController],
  exports: [TypeOrmModule],
})
export class CallModule {}
