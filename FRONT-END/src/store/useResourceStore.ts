import { create } from 'zustand';

export type ResourceType = 'oxygen' | 'water' | 'supplies' | 'food';

export interface Resource {
  id: ResourceType;
  name: string;
  current: number;
  max: number;
  unit: string;
  criticalLevel: number;
  icon: string;
  history: number[];
}

export interface ResupplyRequest {
  id: string;
  resourceId: ResourceType;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'completed';
}

interface ResourceState {
  resources: Record<ResourceType, Resource>;
  resupplyRequests: ResupplyRequest[];
  updateResource: (id: ResourceType, current: number) => void;
  requestResupply: (resourceId: ResourceType) => void;
  consumeResource: (id: ResourceType, amount: number) => void;
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: {
    oxygen: {
      id: 'oxygen',
      name: 'Oxígeno (O₂)',
      current: 2500,
      max: 5000,
      unit: 'L',
      criticalLevel: 1000,
      icon: '🌬️',
      history: [2800, 2700, 2600, 2550, 2500],
    },
    water: {
      id: 'water',
      name: 'Agua (H₂O)',
      current: 800,
      max: 2000,
      unit: 'L',
      criticalLevel: 500,
      icon: '💧',
      history: [1200, 1100, 1000, 900, 800],
    },
    supplies: {
      id: 'supplies',
      name: 'Repuestos',
      current: 45,
      max: 100,
      unit: 'unidades',
      criticalLevel: 20,
      icon: '🔧',
      history: [60, 55, 52, 48, 45],
    },
    food: {
      id: 'food',
      name: 'Comida',
      current: 350,
      max: 500,
      unit: 'kg',
      criticalLevel: 150,
      icon: '🍎',
      history: [420, 400, 380, 365, 350],
    },
  },
  resupplyRequests: [],
  
  updateResource: (id, current) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [id]: {
          ...state.resources[id],
          current,
          history: [...state.resources[id].history.slice(-4), current],
        },
      },
    })),
  
  requestResupply: (resourceId) =>
    set((state) => {
      const newRequest: ResupplyRequest = {
        id: `req-${Date.now()}`,
        resourceId,
        timestamp: new Date(),
        status: 'pending',
      };
      return {
        resupplyRequests: [...state.resupplyRequests, newRequest],
      };
    }),
  
  consumeResource: (id, amount) =>
    set((state) => {
      const resource = state.resources[id];
      const newCurrent = Math.max(0, resource.current - amount);
      return {
        resources: {
          ...state.resources,
          [id]: {
            ...resource,
            current: newCurrent,
            history: [...resource.history.slice(-4), newCurrent],
          },
        },
      };
    }),
}));
