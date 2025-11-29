import { Controller, Get } from '@nestjs/common';
import { TestPingService } from './test-ping.service';

@Controller('test-ping')
export class TestPingController {
  constructor(private readonly service: TestPingService) {}

  @Get()
  async getAll() {
    return this.service.findAll();
  }
}
