import { io, Socket } from 'socket.io-client';
import type { ResourceCard } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const resourcesSocket: Socket< any, any > = io(
  ${API_URL}/resources,
  {
    autoConnect: false,
  },
);

// Opcional: tipos de eventos si quieres ponerte fino
export type ResourcesServerEvents = {
  initialState: (data: ResourceCard[]) => void;
  resourceUpdate: (data: ResourceCard) => void;
  bulkUpdate: (data: ResourceCard[]) => void;
  criticalAlert: (data: ResourceCard) => void;
};