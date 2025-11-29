import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestPing } from './test-ping.entity';
import { TestPingService } from './test-ping.service';
import { TestPingController } from './test-ping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestPing])],
  providers: [TestPingService],
  controllers: [TestPingController],
})
export class TestPingModule {}
