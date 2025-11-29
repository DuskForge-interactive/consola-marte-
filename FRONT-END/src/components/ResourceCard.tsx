import type { ResourceCard as ResourceCardDto } from '@/lib/api';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const RESOURCE_METADATA: Record<
  string,
  { icon: string; description: string }
> = {
  OXYGEN: {
    icon: '🌬️',
    description: 'Oxígeno disponible en hábitat',
  },
  WATER: { icon: '💧', description: 'Reservas de agua tratada' },
  FOOD: { icon: '🍎', description: 'Comida lista para consumo' },
  ENERGY: { icon: '⚡', description: 'Capacidad de energía' },
};

interface ResourceCardProps {
  resource: ResourceCardDto;
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const metadata =
    RESOURCE_METADATA[resource.id] ?? ({
      icon: '🛰️',
      description: 'Recurso monitoreado',
    } as const);

  const percentage = Math.min(resource.currentPercentage, 100);
  const isCritical = resource.isCritical;
  const warningThreshold = resource.criticalPercentage + 10;
  const optimalThreshold = 95;
  const isWarning = !isCritical && percentage <= warningThreshold;
  const isOptimal = !isCritical && !isWarning && percentage >= optimalThreshold;
  const lastUpdated = new Date(resource.lastUpdated).toLocaleTimeString();
  const consumptionPerHour = resource.consumptionRatePerMinute * 60;
  const minutesToCritical =
    resource.consumptionRatePerMinute > 0
      ? (resource.currentPercentage - resource.criticalPercentage) /
        resource.consumptionRatePerMinute
      : null;
  const autonomyLabel =
    minutesToCritical === null
      ? 'Consumo estable'
      : minutesToCritical <= 0
        ? 'Umbral alcanzado'
        : `${(minutesToCritical / 60).toFixed(1)} h restantes`;

  const getStatusColor = () => 'text-foreground';

  const getProgressColor = () => {
    if (isCritical) return 'bg-critical';
    if (isWarning) return 'bg-warning';
    if (isOptimal) return 'bg-success';
    return 'bg-muted-foreground';
  };

  return (
    <div className="block rounded-xl">
      <Card
        className={`glass-strong p-6 space-y-4 transition-all duration-300 hover:scale-[1.02] ${
          isCritical ? 'glow-critical border-critical/50' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{metadata.icon}</span>
              <h3 className="text-lg font-bold text-foreground">
                {resource.name}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              ID: {resource.id}
            </p>
            <p className="text-xs text-muted-foreground">
              {metadata.description}
            </p>
          </div>

          {isCritical && (
            <div className="flex items-center gap-1 text-critical animate-pulse">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-bold">CRÍTICO</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className={`text-4xl font-bold ${getStatusColor()}`}>
              {percentage.toFixed(2)}%
            </span>
            <span className="text-sm text-muted-foreground">
              {autonomyLabel}
            </span>
          </div>

          <div className="relative">
            <Progress value={percentage} className="h-2 bg-muted/30" />
            <div
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Consumo: {consumptionPerHour.toFixed(2)} pts/h
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                Actualizado: {lastUpdated}
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              Umbral crítico: {resource.criticalPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>
      </div>
  );
};
