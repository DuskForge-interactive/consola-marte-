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
  unit: string;
}

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
  activityLog: ActivityEntry[];
  population: number;
  setResources: (resources: ResourceCard[]) => void;
  upsertResource: (resource: ResourceCard) => void;
  bulkUpdate: (resources: ResourceCard[]) => void;
  requestResupply: (resourceId: string) => void;
  addCriticalAlert: (resource: ResourceCard) => void;
  clearCriticalAlerts: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  removeResource: (resourceId: string) => void;
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
  activityLog: [],
  population: 0,
  setResources: (items) =>
    set({
      resources: toRecord(items),
      population: items[0]?.population ?? 0,
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
        unit: resource.unit,
      });

      const formatQuantity = (value: number | null) =>
        (value ?? 0).toFixed(2);

      if (!previous) {
        activityLog = [
          createEntry(
            `${resource.name} registrado con ${formatQuantity(resource.currentQuantity)} ${resource.unit}`,
          ),
          ...activityLog,
        ].slice(0, MAX_ACTIVITY_ENTRIES);
      } else {
        const delta = Number(
          ((resource.currentQuantity ?? 0) - (previous.currentQuantity ?? 0)).toFixed(2),
        );
        const becameCritical = !previous.isCritical && resource.isCritical;
        const recovered = previous.isCritical && !resource.isCritical;

        if (delta !== 0 || becameCritical || recovered) {
          let message: string;
          if (delta > 0) {
            message = `${resource.name} subió a ${formatQuantity(resource.currentQuantity)} ${resource.unit}`;
          } else if (delta < 0) {
            message = `${resource.name} bajó a ${formatQuantity(resource.currentQuantity)} ${resource.unit}`;
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
        population: resource.population ?? state.population,
      };
    }),
  bulkUpdate: (items) =>
    set((state) => ({
      resources: {
        ...state.resources,
        ...toRecord(items),
      },
      population: items[0]?.population ?? state.population,
    })),
  removeResource: (resourceId) =>
    set((state) => {
      const { [resourceId]: _removed, ...rest } = state.resources;
      return {
        resources: rest,
      };
    }),
  requestResupply: (resourceId) =>
    set((state) => {
      const resource = state.resources[resourceId];
      const timestamp = new Date().toISOString();
      let resources = state.resources;
      let activityLog = state.activityLog;
      let requestStatus: ResupplyRequest['status'] = 'pending';

      if (resource && resource.safetyStockAmount > 0) {
        const targetAddition = Number(resource.safetyStockAmount.toFixed(2));
        const currentQuantity = resource.currentQuantity ?? 0;
        const capacityLimit =
          typeof resource.maxCapacity === 'number'
            ? resource.maxCapacity
            : Number.POSITIVE_INFINITY;
        const unclampedAmount = currentQuantity + targetAddition;
        const newAmount = Number(
          Math.min(capacityLimit, unclampedAmount).toFixed(2),
        );
        const actualAdded = Number(
          (newAmount - currentQuantity).toFixed(2),
        );
        if (actualAdded > 0) {
          const newPercentage =
            capacityLimit && Number.isFinite(capacityLimit)
              ? Number(
                  Math.min(
                    100,
                    (newAmount / capacityLimit) * 100,
                  ).toFixed(2),
                )
              : resource.currentPercentage;
          const totalConsumption = resource.totalConsumptionPerHour;
          const newHours =
            totalConsumption > 0
              ? Number((newAmount / totalConsumption).toFixed(2))
              : null;
          const safeWindow = resource.safeWindowHours;
          const derivedCritical =
            newHours !== null && safeWindow > 0
              ? newHours < safeWindow
              : newPercentage <= resource.criticalPercentage;
          const updatedResource: ResourceCard = {
            ...resource,
            currentQuantity: newAmount,
            currentPercentage: newPercentage,
            autonomyHours: newHours,
            isCritical: derivedCritical,
            lastUpdated: timestamp,
          };

          resources = {
            ...state.resources,
            [resourceId]: updatedResource,
          };

          activityLog = [
            {
              id: `resupply-${resourceId}-${Date.now()}`,
              timestamp,
              resourceId,
              resourceName: resource.name,
              message: `${resource.name} reabastecido con ${actualAdded.toFixed(2)} ${resource.unit} (ventana ${resource.safeWindowHours}h)`,
              change: actualAdded,
              percentage: updatedResource.currentPercentage,
              isCritical: updatedResource.isCritical,
              unit: resource.unit,
            },
            ...state.activityLog,
          ].slice(0, MAX_ACTIVITY_ENTRIES);

          requestStatus = 'completed';
        }
      }

      return {
        resources,
        activityLog,
        resupplyRequests: [
          ...state.resupplyRequests,
          {
            id: `req-${Date.now()}`,
            resourceId,
            timestamp,
            status: requestStatus,
          },
        ],
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
}));
