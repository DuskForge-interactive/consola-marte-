import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceStatus } from './resource-status.entity';
import { ResourceKind } from './resource-kind.entity';
import { ResourceHistory } from './resource-history.entity';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { ResourcesGateway } from './resources.gateway';
import { ResourcesRealtimeService } from './resources-realtime.service';
import { ResourcesDecayService } from './resources-decay.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceStatus, ResourceKind, ResourceHistory]),
  ],
  providers: [
    ResourcesService,
    ResourcesGateway,
    ResourcesRealtimeService,
    ResourcesDecayService,
  ],
  controllers: [ResourcesController],
})
export class ResourcesModule {}
