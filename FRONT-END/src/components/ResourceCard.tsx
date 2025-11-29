import type { ResourceCard as ResourceCardDto } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  onRequestResupply: (resource: ResourceCardDto) => void;
}

export const ResourceCard = ({
  resource,
  onRequestResupply,
}: ResourceCardProps) => {
  const navigate = useNavigate();
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
  const trend = resource.totalConsumptionPerHour;
  const lastUpdated = new Date(resource.lastUpdated).toLocaleTimeString();
  const hoursLeft = resource.autonomyHours;
  const daysLeft =
    hoursLeft === null ? null : Number((hoursLeft / 24).toFixed(1));
  const autonomyLabel =
    hoursLeft === null
      ? 'Autonomía estable'
      : `${hoursLeft.toFixed(1)} h${
          daysLeft !== null ? ` (${daysLeft} d)` : ''
        }`;

  const getStatusColor = () => 'text-foreground';

  const getProgressColor = () => {
    if (isCritical) return 'bg-critical';
    if (isWarning) return 'bg-warning';
    if (isOptimal) return 'bg-success';
    return 'bg-muted-foreground';
  };

  return (
    <div
      onClick={() => navigate(`/resource/${resource.id}`)}
      className="cursor-pointer"
    >
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
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {metadata.description}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Disponible: {(resource.currentQuantity ?? 0).toLocaleString()} {resource.unit}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Capacidad máx.:{' '}
                {resource.maxCapacity !== null
                  ? resource.maxCapacity.toLocaleString()
                  : 'N/D'}{' '}
                {resource.unit}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                Ventana segura ({resource.safeWindowHours}h):{' '}
                {resource.safetyStockAmount.toLocaleString()} {resource.unit}
              </p>
            </div>
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
              Autonomía: {autonomyLabel}
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
                Consumo neto:{' '}
                {trend.toFixed(2)} {resource.unit}/h
              </span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingDown className="h-3 w-3" />
                Actualizado: {lastUpdated}
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              Por persona:{' '}
              {resource.perCapitaConsumptionPerHour.toFixed(2)}{' '}
              {resource.unit}/h
            </div>
          </div>
        </div>

        <Button
          onClick={(event) => {
            event.stopPropagation();
            onRequestResupply(resource);
          }}
          variant={isCritical ? 'destructive' : 'secondary'}
          className={`w-full font-semibold ${isCritical ? 'glow-critical' : ''}`}
        >
          {isCritical ? '🚨 RESUPPLY URGENTE' : '📦 Solicitar Resupply'}
        </Button>
      </Card>
    </div>
  );
};
