import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ResourcesService } from './resources.service';
import { ResourceCardDto } from './dto/resource-card.dto';

@WebSocketGateway({
  namespace: '/resources',
  cors: { origin: '*' },
})
export class ResourcesGateway {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(ResourcesGateway.name);

  constructor(private readonly resourcesService: ResourcesService) {}

  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: Socket) {
    try {
      const resources = await this.resourcesService.getAllForDashboard();
      client.emit('initialState', resources);
    } catch (error) {
      this.logger.error(
        'Failed to send initial resource state',
        error as Error,
      );
      client.emit('error', 'Unable to retrieve resources');
    }
  }

  broadcastResourceUpdate(resource: ResourceCardDto) {
    this.server.emit('resourceUpdate', resource);
  }

  broadcastCriticalAlert(resource: ResourceCardDto) {
    this.server.emit('criticalAlert', resource);
  }

  broadcastBulkUpdate(resources: ResourceCardDto[]) {
    this.server.emit('bulkUpdate', resources);
  }
}
