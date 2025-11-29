import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestPing } from './test-ping.entity';

@Injectable()
export class TestPingService {
  constructor(
    @InjectRepository(TestPing)
    private readonly repo: Repository<TestPing>,
  ) {}

  findAll() {
    return this.repo.find();
  }
}
