import { create } from 'zustand';
import type { ResourceCard } from '@/lib/api';

export interface ResupplyRequest {
  id: string;
  resourceId: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

interface ResourceState {
  resources: Record<string, ResourceCard>;
  resupplyRequests: ResupplyRequest[];
  criticalQueue: ResourceCard[];
  connectionStatus: ConnectionStatus;
  setResources: (resources: ResourceCard[]) => void;
  upsertResource: (resource: ResourceCard) => void;
  bulkUpdate: (resources: ResourceCard[]) => void;
  requestResupply: (resourceId: string) => void;
  addCriticalAlert: (resource: ResourceCard) => void;
  clearCriticalAlerts: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

const toRecord = (items: ResourceCard[]) =>
  items.reduce<Record<string, ResourceCard>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export const useResourceStore = create<ResourceState>((set) => ({
  resources: {},
  resupplyRequests: [],
  criticalQueue: [],
  connectionStatus: 'idle',
  setResources: (items) =>
    set({
      resources: toRecord(items),
    }),
  upsertResource: (resource) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [resource.id]: resource,
      },
    })),
  bulkUpdate: (items) =>
    set((state) => ({
      resources: {
        ...state.resources,
        ...toRecord(items),
      },
    })),
  requestResupply: (resourceId) =>
    set((state) => ({
      resupplyRequests: [
        ...state.resupplyRequests,
        {
          id: `req-${Date.now()}`,
          resourceId,
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
      ],
    })),
  addCriticalAlert: (resource) =>
    set((state) => ({
      criticalQueue: [...state.criticalQueue, resource],
    })),
  clearCriticalAlerts: () =>
    set({
      criticalQueue: [],
    }),
  setConnectionStatus: (status) =>
    set({
      connectionStatus: status,
    }),
}));
