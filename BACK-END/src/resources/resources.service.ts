import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceStatus } from './resource-status.entity';
import { ResourceCardDto } from './dto/resource-card.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceKind } from './resource-kind.entity';
import { ResourceHistory } from './resource-history.entity';
import { ResourceHistoryPointDto } from './dto/resource-history-point.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(ResourceStatus)
    private readonly statusRepo: Repository<ResourceStatus>,
    @InjectRepository(ResourceKind)
    private readonly kindRepo: Repository<ResourceKind>,
    @InjectRepository(ResourceHistory)
    private readonly historyRepo: Repository<ResourceHistory>,
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

  async createResource(dto: CreateResourceDto): Promise<ResourceCardDto> {
    const code = dto.code.toUpperCase();
    let kind = await this.kindRepo.findOne({ where: { code } });

    if (!kind) {
      kind = this.kindRepo.create({
        code,
        display_name: dto.displayName,
        default_critical_percentage: dto.criticalPercentage.toString(),
        default_consumption_rate_per_minute:
          dto.consumptionRatePerMinute.toString(),
      });
    } else {
      if (dto.displayName && dto.displayName !== kind.display_name) {
        kind.display_name = dto.displayName;
      }
      kind.default_critical_percentage = dto.criticalPercentage.toString();
      kind.default_consumption_rate_per_minute =
        dto.consumptionRatePerMinute.toString();
    }

    const savedKind = await this.kindRepo.save(kind);

    const isCritical =
      dto.isCritical ?? dto.currentPercentage <= dto.criticalPercentage;

    const status = this.statusRepo.create({
      kind: savedKind,
      kind_id: savedKind.id,
      current_percentage: dto.currentPercentage.toString(),
      critical_percentage: dto.criticalPercentage.toString(),
      consumption_rate_per_minute: dto.consumptionRatePerMinute.toString(),
      is_critical: isCritical,
      last_updated: new Date(),
    });

    const savedStatus = await this.statusRepo.save(status);
    await this.logHistory(savedStatus, 'CREATE', 'Resource created');
    const reloaded = await this.statusRepo.findOne({
      where: { id: savedStatus.id },
      relations: ['kind'],
    });
    return this.toCardDto(reloaded as ResourceStatus);
  }

  async updateResource(
    code: string,
    dto: UpdateResourceDto,
  ): Promise<ResourceCardDto> {
    const status = await this.statusRepo.findOne({
      where: { kind: { code } },
      relations: ['kind'],
    });

    if (!status) {
      throw new NotFoundException(`Resource with code "${code}" not found`);
    }

    let shouldSaveKind = false;

    if (dto.displayName) {
      status.kind.display_name = dto.displayName;
      shouldSaveKind = true;
    }

    if (dto.currentPercentage !== undefined) {
      status.current_percentage = dto.currentPercentage.toString();
    }

    if (dto.criticalPercentage !== undefined) {
      status.critical_percentage = dto.criticalPercentage.toString();
      status.kind.default_critical_percentage =
        dto.criticalPercentage.toString();
      shouldSaveKind = true;
    }

    if (dto.consumptionRatePerMinute !== undefined) {
      status.consumption_rate_per_minute =
        dto.consumptionRatePerMinute.toString();
      status.kind.default_consumption_rate_per_minute =
        dto.consumptionRatePerMinute.toString();
      shouldSaveKind = true;
    }

    if (shouldSaveKind) {
      await this.kindRepo.save(status.kind);
    }

    if (dto.isCritical !== undefined) {
      status.is_critical = dto.isCritical;
    } else if (
      dto.currentPercentage !== undefined ||
      dto.criticalPercentage !== undefined
    ) {
      const current =
        dto.currentPercentage ?? Number(status.current_percentage);
      const critical =
        dto.criticalPercentage ?? Number(status.critical_percentage);
      status.is_critical = current <= critical;
    }

    status.last_updated = new Date();
    const updated = await this.statusRepo.save(status);
    await this.logHistory(updated, 'ADMIN_UPDATE', 'Resource updated by admin');
    return this.toCardDto(updated);
  }

  async deleteResource(code: string): Promise<void> {
    const status = await this.statusRepo.findOne({
      where: { kind: { code } },
      relations: ['kind'],
    });

    if (!status) {
      throw new NotFoundException(`Resource with code "${code}" not found`);
    }

    await this.statusRepo.remove(status);
    await this.historyRepo.delete({ status_id: status.id });
  }

  async getByStatusId(statusId: string): Promise<ResourceCardDto> {
    const status = await this.statusRepo.findOne({
      where: { id: statusId },
      relations: ['kind'],
    });

    if (!status) {
      throw new NotFoundException(
        `Resource status with id "${statusId}" not found`,
      );
    }

    return this.toCardDto(status);
  }

  async applyConsumptionDecay(tickSeconds = 30): Promise<ResourceCardDto[]> {
    const updatedResources: ResourceCardDto[] = [];
    const statuses = await this.statusRepo.find({ relations: ['kind'] });
    const tickFactor = tickSeconds / 60;

    for (const status of statuses) {
      const current = Number(status.current_percentage);
      const rate = Number(status.consumption_rate_per_minute);
      const delta = rate * tickFactor;
      if (delta <= 0) {
        continue;
      }

      const nextValue = Math.max(0, current - delta);
      if (nextValue === current) {
        continue;
      }

      status.current_percentage = nextValue.toFixed(2);
      status.is_critical = nextValue <= Number(status.critical_percentage);
      status.last_updated = new Date();

      const updated = await this.statusRepo.save(status);
      await this.logHistory(
        updated,
        'DECAY',
        `Automatic decay tick (${tickSeconds}s)`,
      );
      const dto = this.toCardDto(updated);
      updatedResources.push(dto);
    }

    return updatedResources;
  }

  async getHistoryByCode(
    code: string,
    from?: Date,
    to?: Date,
  ): Promise<ResourceHistoryPointDto[]> {
    const qb = this.historyRepo
      .createQueryBuilder('history')
      .innerJoin('history.status', 'status')
      .innerJoin('status.kind', 'kind')
      .where('kind.code = :code', { code });

    if (from) {
      qb.andWhere('history.measured_at >= :from', { from });
    }

    if (to) {
      qb.andWhere('history.measured_at <= :to', { to });
    }

    const rows = await qb.orderBy('history.measured_at', 'ASC').getMany();

    return rows.map((row) => ({
      timestamp: row.measured_at,
      percentage: Number(row.percentage),
      isCritical: row.is_critical,
    }));
  }

  private async logHistory(
    status: ResourceStatus,
    eventType: string,
    note?: string,
  ) {
    await this.historyRepo.insert({
      status_id: status.id,
      measured_at: new Date(),
      percentage: status.current_percentage,
      is_critical: status.is_critical,
      event_type: eventType,
      note,
    });
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
