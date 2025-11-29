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
import { ColonyState } from './colony-state.entity';
import { getResourceProfile } from './resource-profiles';
import { UpdatePopulationResponseDto } from './dto/update-population-response.dto';

interface ResourceMetrics {
  currentPercentage: number;
  criticalPercentage: number;
  autonomyHours: number | null;
  isCritical: boolean;
  totalConsumptionPerHour: number;
  perCapitaConsumptionPerHour: number;
  safetyStockAmount: number;
  safeWindowHours: number;
}

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(ResourceStatus)
    private readonly statusRepo: Repository<ResourceStatus>,
    @InjectRepository(ResourceKind)
    private readonly kindRepo: Repository<ResourceKind>,
    @InjectRepository(ResourceHistory)
    private readonly historyRepo: Repository<ResourceHistory>,
    @InjectRepository(ColonyState)
    private readonly colonyRepo: Repository<ColonyState>,
  ) {}

  async getAllForDashboard(): Promise<ResourceCardDto[]> {
    const statuses = await this.statusRepo.find({
      relations: ['kind'],
    });
    const fallbackPopulation = await this.getCurrentPopulation();

    return statuses.map((status) =>
      this.toCardDto(this.ensurePopulation(status, fallbackPopulation)),
    );
  }

  async getByCode(code: string): Promise<ResourceCardDto> {
    const status = await this.statusRepo.findOne({
      where: { kind: { code } },
      relations: ['kind'],
    });

    if (!status) {
      throw new NotFoundException(`Resource with code "${code}" not found`);
    }

    const fallbackPopulation = await this.getCurrentPopulation();
    return this.toCardDto(this.ensurePopulation(status, fallbackPopulation));
  }

  async createResource(dto: CreateResourceDto): Promise<ResourceCardDto> {
    const code = dto.code.toUpperCase();
    let kind = await this.kindRepo.findOne({ where: { code } });
    const colonyPopulation = await this.getCurrentPopulation();
    const profile = getResourceProfile(code, dto.unit ?? kind?.unit);
    const unit = dto.unit ?? kind?.unit ?? profile.unit;
    const perCapita =
      dto.perCapitaConsumptionPerHour ?? profile.perCapitaConsumptionPerHour;
    const safeWindowHours = dto.safeWindowHours ?? profile.safetyWindowHours;
    const baseMaxCapacity = dto.maxCapacity ?? profile.maxCapacity;
    const minimumCapacity =
      perCapita * colonyPopulation * (safeWindowHours || 0);
    const maxCapacity = Math.max(baseMaxCapacity, minimumCapacity);
    const currentQuantity = Number(dto.currentAmount ?? 0);

    if (!kind) {
      kind = this.kindRepo.create({
        code,
        display_name: dto.displayName,
        default_critical_percentage: '0',
        default_consumption_rate_per_minute: '0',
        unit,
        per_person_rate_per_minute: (perCapita / 60).toFixed(4),
      });
    } else {
      if (dto.displayName && dto.displayName !== kind.display_name) {
        kind.display_name = dto.displayName;
      }
      kind.unit = unit;
      kind.per_person_rate_per_minute = (perCapita / 60).toFixed(4);
    }

    const savedKind = await this.kindRepo.save(kind);

    const status = this.statusRepo.create({
      kind: savedKind,
      kind_id: savedKind.id,
      current_percentage: '0',
      critical_percentage: '0',
      current_quantity: currentQuantity.toFixed(2),
      max_capacity: maxCapacity.toFixed(2),
      population: colonyPopulation,
      per_capita_consumption_per_hour: perCapita.toFixed(3),
      safe_window_hours: safeWindowHours.toFixed(2),
      is_critical: dto.isCritical ?? false,
      last_updated: new Date(),
    });

    const savedStatus = await this.updateStatus(status, dto.isCritical);
    await this.logHistory(savedStatus, 'CREATE', 'Resource created');
    return this.toCardDto(savedStatus);
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

    if (dto.displayName) {
      status.kind.display_name = dto.displayName;
    }

    if (dto.unit) {
      status.kind.unit = dto.unit;
    }

    if (dto.currentAmount !== undefined) {
      status.current_quantity = dto.currentAmount.toFixed(2);
    }

    if (dto.maxCapacity !== undefined) {
      status.max_capacity = dto.maxCapacity.toFixed(2);
    }

    if (dto.perCapitaConsumptionPerHour !== undefined) {
      status.per_capita_consumption_per_hour =
        dto.perCapitaConsumptionPerHour.toFixed(3);
      status.kind.per_person_rate_per_minute = (
        dto.perCapitaConsumptionPerHour / 60
      ).toFixed(4);
    }

    if (dto.safeWindowHours !== undefined) {
      status.safe_window_hours = dto.safeWindowHours.toFixed(2);
    }

    await this.kindRepo.save(status.kind);
    const updated = await this.updateStatus(status, dto.isCritical);
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

  async updatePopulation(
    populationInput: number,
  ): Promise<UpdatePopulationResponseDto> {
    const population = Math.max(1, Math.floor(populationInput));
    const record = this.colonyRepo.create({
      current_population: population,
      updated_at: new Date(),
    });
    const savedState = await this.colonyRepo.save(record);

    const statuses = await this.statusRepo.find({ relations: ['kind'] });
    const updatedResources: ResourceCardDto[] = [];

    for (const status of statuses) {
      status.population = population;
      const perCapita = Number(status.per_capita_consumption_per_hour ?? 0);
      const safeWindow = Number(status.safe_window_hours ?? 0);
      if (perCapita > 0 && safeWindow > 0) {
        const minCapacity = perCapita * population * safeWindow;
        const currentMax = Number(status.max_capacity ?? 0);
        if (minCapacity > currentMax) {
          status.max_capacity = minCapacity.toFixed(2);
        }
      }

      const updatedStatus = await this.updateStatus(status);
      await this.logHistory(
        updatedStatus,
        'POPULATION_UPDATE',
        `Colonia actualizada a ${population} colonos`,
      );
      updatedResources.push(this.toCardDto(updatedStatus));
    }

    return {
      population,
      updatedAt: savedState.updated_at,
      resources: updatedResources,
    };
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

    const fallbackPopulation = await this.getCurrentPopulation();
    return this.toCardDto(this.ensurePopulation(status, fallbackPopulation));
  }

  async applyConsumptionDecay(tickSeconds = 30): Promise<ResourceCardDto[]> {
    const updatedResources: ResourceCardDto[] = [];
    const statuses = await this.statusRepo.find({ relations: ['kind'] });
    const fallbackPopulation = await this.getCurrentPopulation();
    const tickFactor = tickSeconds / 3600; // convert seconds to hours

    for (const status of statuses) {
      this.ensurePopulation(status, fallbackPopulation);
      const perCapita =
        Number(status.per_capita_consumption_per_hour ?? 0) || 0;
      const population = status.population ?? 0;
      const totalConsumptionPerHour =
        perCapita > 0 && population > 0 ? perCapita * population : 0;
      if (totalConsumptionPerHour <= 0) {
        continue;
      }

      const currentQuantity = Number(status.current_quantity ?? 0);
      const delta = totalConsumptionPerHour * tickFactor;
      const nextQuantity = Math.max(0, currentQuantity - delta);
      if (nextQuantity === currentQuantity) {
        continue;
      }

      status.current_quantity = nextQuantity.toFixed(2);
      const updated = await this.updateStatus(status);
      await this.logHistory(
        updated,
        'DECAY',
        `Automatic decay tick (${tickSeconds}s)`,
      );
      updatedResources.push(this.toCardDto(updated));
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
    const metrics = this.computeMetrics(status);

    return {
      id: status.kind.code,
      statusId: status.id,
      name: status.kind.display_name,
      unit: status.kind.unit ?? 'unit',
      currentPercentage: metrics.currentPercentage,
      criticalPercentage: metrics.criticalPercentage,
      isCritical: metrics.isCritical,
      autonomyHours: metrics.autonomyHours,
      currentQuantity: status.current_quantity
        ? Number(status.current_quantity)
        : null,
      maxCapacity: status.max_capacity ? Number(status.max_capacity) : null,
      totalConsumptionPerHour: metrics.totalConsumptionPerHour,
      perCapitaConsumptionPerHour: metrics.perCapitaConsumptionPerHour,
      safeWindowHours: metrics.safeWindowHours,
      safetyStockAmount: metrics.safetyStockAmount,
      population: status.population ?? 0,
      lastUpdated: status.last_updated,
    };
  }

  private computeMetrics(status: ResourceStatus): ResourceMetrics {
    const quantity = Number(status.current_quantity ?? 0);
    const maxCapacity = Number(status.max_capacity ?? 0);
    const population = status.population ?? 0;
    const perCapita =
      Number(status.per_capita_consumption_per_hour ?? 0) || 0;
    const safeWindowHours =
      Number(status.safe_window_hours ?? 0) >= 0
        ? Number(status.safe_window_hours ?? 0)
        : 0;

    const totalConsumptionPerHour =
      population > 0 && perCapita > 0 ? population * perCapita : 0;
    const autonomyHours =
      totalConsumptionPerHour > 0
        ? Number((quantity / totalConsumptionPerHour).toFixed(2))
        : null;

    const cappedQuantity =
      maxCapacity > 0 ? Math.min(quantity, maxCapacity) : quantity;
    const currentPercentage =
      maxCapacity > 0
        ? Number(((cappedQuantity / maxCapacity) * 100).toFixed(2))
        : 0;

    const safetyStockAmount =
      totalConsumptionPerHour > 0 && safeWindowHours > 0
        ? Number((totalConsumptionPerHour * safeWindowHours).toFixed(2))
        : 0;

    const criticalPercentage =
      maxCapacity > 0
        ? Number(((safetyStockAmount / maxCapacity) * 100).toFixed(2))
        : 0;

    const isCritical =
      autonomyHours !== null && safeWindowHours > 0
        ? autonomyHours < safeWindowHours
        : currentPercentage <= criticalPercentage;

    return {
      currentPercentage,
      criticalPercentage,
      autonomyHours,
      isCritical,
      totalConsumptionPerHour,
      perCapitaConsumptionPerHour: perCapita,
      safetyStockAmount,
      safeWindowHours,
    };
  }

  private async updateStatus(
    status: ResourceStatus,
    forceCritical?: boolean,
  ): Promise<ResourceStatus> {
    const metrics = this.computeMetrics(status);
    status.current_percentage = metrics.currentPercentage.toFixed(2);
    status.critical_percentage = metrics.criticalPercentage.toFixed(2);
    status.is_critical =
      forceCritical !== undefined ? forceCritical : metrics.isCritical;
    status.last_updated = new Date();
    return this.statusRepo.save(status);
  }

  private ensurePopulation(
    status: ResourceStatus,
    fallbackPopulation: number,
  ): ResourceStatus {
    if (status.population == null) {
      status.population = fallbackPopulation;
    }
    return status;
  }

  private async getCurrentPopulation(): Promise<number> {
    const [latest] = await this.colonyRepo.find({
      order: { updated_at: 'DESC' },
      take: 1,
    });
    return latest?.current_population ?? 1;
  }
}
