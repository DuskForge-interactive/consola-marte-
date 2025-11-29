import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

// typed interface matching your ResourceCardDto
export interface ResourceCard {
  id: string;                 // 'OXYGEN'
  statusId: string;           // uuid
  name: string;               // 'Oxígeno (O₂)'
  currentPercentage: number;
  unit: string;
  currentQuantity: number | null;
  maxCapacity: number | null;
  criticalPercentage: number;
  isCritical: boolean;
  totalConsumptionPerHour: number;
  perCapitaConsumptionPerHour: number;
  autonomyHours: number | null;
  safeWindowHours: number;
  safetyStockAmount: number;
  population: number;
  lastUpdated: string;
}

export interface ResourceHistoryPoint {
  timestamp: string;
  percentage: number;
  isCritical: boolean;
}

export interface CreateResourcePayload {
  code: string;
  displayName: string;
  unit: string;
  currentAmount: number;
  maxCapacity: number;
  perCapitaConsumptionPerHour: number;
  safeWindowHours?: number;
  isCritical?: boolean;
}

export interface UpdateResourcePayload {
  displayName?: string;
  unit?: string;
  currentAmount?: number;
  maxCapacity?: number;
  perCapitaConsumptionPerHour?: number;
  safeWindowHours?: number;
  isCritical?: boolean;
}

export async function fetchResources(): Promise<ResourceCard[]> {
  const res = await api.get<ResourceCard[]>('/resources');
  return res.data;
}

export async function fetchResourceByCode(code: string): Promise<ResourceCard> {
  const res = await api.get<ResourceCard>(`/resources/${code}`);
  return res.data;
}

export async function createResource(
  payload: CreateResourcePayload,
): Promise<ResourceCard> {
  const res = await api.post<ResourceCard>('/resources', payload);
  return res.data;
}

export async function updateResource(
  code: string,
  payload: UpdateResourcePayload,
): Promise<ResourceCard> {
  const res = await api.patch<ResourceCard>(`/resources/${code}`, payload);
  return res.data;
}

export async function deleteResource(code: string): Promise<void> {
  await api.delete(`/resources/${code}`);
}

export async function fetchResourceHistory(
  code: string,
  params?: { from?: string; to?: string },
): Promise<ResourceHistoryPoint[]> {
  const res = await api.get<ResourceHistoryPoint[]>(
    `/resources/${code}/history`,
    { params },
  );
  return res.data;
}
