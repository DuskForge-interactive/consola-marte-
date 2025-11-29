import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ResourcesService } from './resources.service';
import { ResourcesGateway } from './resources.gateway';

@Injectable()
export class ResourcesDecayService {
  private readonly logger = new Logger(ResourcesDecayService.name);

  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly resourcesGateway: ResourcesGateway,
  ) {}

  @Interval(30_000)
  async handleDecayTick() {
    try {
      const updatedResources =
        await this.resourcesService.applyConsumptionDecay(30);
      if (updatedResources.length > 0) {
        updatedResources.forEach((resource) => {
          this.resourcesGateway.broadcastResourceUpdate(resource);
          if (resource.isCritical) {
            this.resourcesGateway.broadcastCriticalAlert(resource);
          }
        });
      }
    } catch (error) {
      this.logger.error('Failed to apply automatic resource decay', error as Error);
    }
  }
}
