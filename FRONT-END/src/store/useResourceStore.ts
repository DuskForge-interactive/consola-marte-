import { create } from 'zustand';
import type { ResourceCard } from '@/lib/api';

const MAX_ACTIVITY_ENTRIES = 60;

export interface ActivityEntry {
  id: string;
  timestamp: string;
  resourceId: string;
  resourceName: string;
  message: string;
  change?: number;
  percentage: number;
  isCritical: boolean;
}

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

interface ResourceState {
  resources: Record<string, ResourceCard>;
  criticalQueue: ResourceCard[];
  connectionStatus: ConnectionStatus;
  activityLog: ActivityEntry[];
  population: number;
  setResources: (resources: ResourceCard[]) => void;
  upsertResource: (resource: ResourceCard) => void;
  bulkUpdate: (resources: ResourceCard[]) => void;
  addCriticalAlert: (resource: ResourceCard) => void;
  clearCriticalAlerts: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  removeResource: (resourceId: string) => void;
  setPopulation: (population: number) => void;
}

const toRecord = (items: ResourceCard[]) =>
  items.reduce<Record<string, ResourceCard>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export const useResourceStore = create<ResourceState>((set) => ({
  resources: {},
  criticalQueue: [],
  connectionStatus: 'idle',
  activityLog: [],
  population: 128,
  setResources: (items) =>
    set({
      resources: toRecord(items),
    }),
  upsertResource: (resource) =>
    set((state) => {
      const previous = state.resources[resource.id];
      const resources = {
        ...state.resources,
        [resource.id]: resource,
      };
      let activityLog = state.activityLog;

      const createEntry = (message: string, change?: number): ActivityEntry => ({
        id: `${resource.id}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        resourceId: resource.id,
        resourceName: resource.name,
        message,
        change,
        percentage: resource.currentPercentage,
        isCritical: resource.isCritical,
      });

      if (!previous) {
        activityLog = [
          createEntry(
            `${resource.name} registrado con ${resource.currentPercentage.toFixed(
              2,
            )}%`,
          ),
          ...activityLog,
        ].slice(0, MAX_ACTIVITY_ENTRIES);
      } else {
        const delta = Number(
          (resource.currentPercentage - previous.currentPercentage).toFixed(2),
        );
        const becameCritical = !previous.isCritical && resource.isCritical;
        const recovered = previous.isCritical && !resource.isCritical;

        if (delta !== 0 || becameCritical || recovered) {
          let message: string;
          if (delta > 0) {
            message = `${resource.name} subió a ${resource.currentPercentage.toFixed(
              2,
            )}%`;
          } else if (delta < 0) {
            message = `${resource.name} bajó a ${resource.currentPercentage.toFixed(
              2,
            )}%`;
          } else if (becameCritical) {
            message = `${resource.name} entró en estado crítico`;
          } else if (recovered) {
            message = `${resource.name} salió del estado crítico`;
          } else {
            message = `${resource.name} actualizado`;
          }

          activityLog = [
            createEntry(
              message,
              delta !== 0 ? delta : undefined,
            ),
            ...activityLog,
          ].slice(0, MAX_ACTIVITY_ENTRIES);
        }
      }

      return {
        resources,
        activityLog,
      };
    }),
  bulkUpdate: (items) =>
    set((state) => ({
      resources: {
        ...state.resources,
        ...toRecord(items),
      },
    })),
  removeResource: (resourceId) =>
    set((state) => {
      const { [resourceId]: _removed, ...rest } = state.resources;
      return {
        resources: rest,
      };
    }),
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
  setPopulation: (population) =>
    set({
      population,
    }),
}));
