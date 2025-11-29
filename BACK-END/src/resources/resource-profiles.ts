export interface ResourceSimulationProfile {
  code: string;
  unit: string;
  maxCapacity: number;
  perCapitaConsumptionPerHour: number;
  safetyWindowHours: number;
}

const DEFAULT_SAFETY_WINDOW_HOURS = 48; // 2 days of buffer by default

const RESOURCE_PROFILES: Record<string, ResourceSimulationProfile> = {
  WATER: {
    code: 'WATER',
    unit: 'L',
    maxCapacity: 60000, // 60 m³ of potable water
    perCapitaConsumptionPerHour: 2.1, // ~50 L/person/day
    safetyWindowHours: 72, // 3 days
  },
  FOOD: {
    code: 'FOOD',
    unit: 'kg',
    maxCapacity: 8000,
    perCapitaConsumptionPerHour: 0.083, // ~2 kg/person/day
    safetyWindowHours: 96, // 4 days
  },
  OXYGEN: {
    code: 'OXYGEN',
    unit: 'kg',
    maxCapacity: 3500,
    perCapitaConsumptionPerHour: 0.035, // ~0.84 kg/person/day
    safetyWindowHours: 48, // 2 days
  },
  ENERGY: {
    code: 'ENERGY',
    unit: 'kWh',
    maxCapacity: 150000,
    perCapitaConsumptionPerHour: 1.5, // ~1.5 kWh per person per hour (~36 kWh/day)
    safetyWindowHours: 24, // 1 day
  },
};

export const getResourceProfile = (
  code: string,
  unitFallback = 'unit',
): ResourceSimulationProfile => {
  const upper = code.toUpperCase();
  const profile = RESOURCE_PROFILES[upper];
  if (profile) {
    return profile;
  }

  return {
    code: upper,
    unit: unitFallback,
    maxCapacity: 10000,
    perCapitaConsumptionPerHour: 0.5,
    safetyWindowHours: DEFAULT_SAFETY_WINDOW_HOURS,
  };
};
