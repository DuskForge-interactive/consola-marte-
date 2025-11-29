import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
  createClient,
} from '@supabase/supabase-js';
import { ResourcesService } from './resources.service';
import { ResourcesGateway } from './resources.gateway';

type ResourceStatusRow = {
  id?: string;
};

@Injectable()
export class ResourcesRealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ResourcesRealtimeService.name);
  private supabaseClient?: SupabaseClient;
  private channel?: RealtimeChannel;

  constructor(
    private readonly configService: ConfigService,
    private readonly resourcesService: ResourcesService,
    private readonly resourcesGateway: ResourcesGateway,
  ) {}

  onModuleInit() {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE') ??
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!url || !key) {
      this.logger.warn(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE/ANON_KEY must be set for realtime updates',
      );
      return;
    }

    this.supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });

    this.channel = this.supabaseClient
      .channel('mars-console-resource-status')
      .on<ResourceStatusRow>(
        'postgres_changes',
        {
          event: '*',
          schema: 'mars_console',
          table: 'resource_status',
        },
        (payload) => {
          void this.handleChange(payload);
        },
      );

    this.channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.logger.log('Listening to Supabase realtime for resource updates');
      } else if (status === 'CHANNEL_ERROR') {
        this.logger.error('Supabase realtime channel error');
      } else if (status === 'CLOSED') {
        this.logger.warn('Supabase realtime channel closed');
      }
    });
  }

  onModuleDestroy() {
    if (this.channel) {
      void this.channel.unsubscribe();
      this.channel = undefined;
    }

    if (this.supabaseClient) {
      this.supabaseClient.removeAllChannels();
      this.supabaseClient = undefined;
    }
  }

  private async handleChange(
    payload: RealtimePostgresChangesPayload<ResourceStatusRow>,
  ) {
    const newRow = payload.new as ResourceStatusRow | null | undefined;
    const oldRow = payload.old as ResourceStatusRow | null | undefined;
    const statusId = newRow?.id ?? oldRow?.id;
    if (!statusId) {
      this.logger.warn('Received realtime payload without status id');
      return;
    }

    try {
      const resource = await this.resourcesService.getByStatusId(statusId);
      this.resourcesGateway.broadcastResourceUpdate(resource);

      if (resource.isCritical) {
        this.resourcesGateway.broadcastCriticalAlert(resource);
      }
    } catch (error) {
      this.logger.error(
        `Failed to broadcast realtime resource update for status ${statusId}`,
        error as Error,
      );
    }
  }
}
