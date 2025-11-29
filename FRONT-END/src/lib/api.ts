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
  criticalPercentage: number;
  isCritical: boolean;
  consumptionRatePerMinute: number;
  lastUpdated: string;
}

export async function fetchResources(): Promise<ResourceCard[]> {
  const res = await api.get<ResourceCard[]>('/resources');
  return res.data;
}

export async function fetchResourceByCode(code: string): Promise<ResourceCard> {
  const res = await api.get<ResourceCard>(`/resources/${code}`);
  return res.data;
}
