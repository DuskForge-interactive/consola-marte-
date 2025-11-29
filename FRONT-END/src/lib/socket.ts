import { io, Socket } from 'socket.io-client';
import type { ResourceCard } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type ResourcesServerEvents = {
  initialState: (data: ResourceCard[]) => void;
  resourceUpdate: (data: ResourceCard) => void;
  bulkUpdate: (data: ResourceCard[]) => void;
  criticalAlert: (data: ResourceCard) => void;
  error: (message: string) => void;
};

export type ResourcesClientEvents = {
  join: () => void;
};

export const resourcesSocket: Socket<
  ResourcesServerEvents,
  ResourcesClientEvents
> = io(`${API_URL}/resources`, {
  autoConnect: false,
});
