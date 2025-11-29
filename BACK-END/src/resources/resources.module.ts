import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceStatus } from './resource-status.entity';
import { ResourceKind } from './resource-kind.entity';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { ResourcesGateway } from './resources.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceStatus, ResourceKind])],
  providers: [ResourcesService, ResourcesGateway],
  controllers: [ResourcesController],
})
export class ResourcesModule {}
