import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceStatus } from './resource-status.entity';
import { ResourceCardDto } from './dto/resource-card.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(ResourceStatus)
    private readonly statusRepo: Repository<ResourceStatus>,
  ) {}

  async getAllForDashboard(): Promise<ResourceCardDto[]> {
    const statuses = await this.statusRepo.find({
      relations: ['kind'],
    });

    return statuses.map((status) => this.toCardDto(status));
  }

  async getByCode(code: string): Promise<ResourceCardDto> {
    const status = await this.statusRepo.findOne({
      where: { kind: { code } },
      relations: ['kind'],
    });

    if (!status) {
      throw new NotFoundException(`Resource with code "${code}" not found`);
    }

    return this.toCardDto(status);
  }

  private toCardDto(status: ResourceStatus): ResourceCardDto {
    return {
      id: status.kind.code,
      statusId: status.id,
      name: status.kind.display_name,
      currentPercentage: Number(status.current_percentage),
      criticalPercentage: Number(status.critical_percentage),
      isCritical: status.is_critical,
      consumptionRatePerMinute: Number(status.consumption_rate_per_minute),
      lastUpdated: status.last_updated,
    };
  }
}
